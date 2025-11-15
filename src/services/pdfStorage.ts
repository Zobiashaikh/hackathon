import { supabase } from '../lib/supabase'

export interface PDFRecord {
  id?: string
  user_id: string
  file_name: string
  file_path: string
  file_size: number
  topics?: string[]
  created_at?: string
  updated_at?: string
}

export const pdfStorageService = {
  // Upload PDF file to Supabase Storage
  async uploadPDF(file: File, userId: string): Promise<{ path: string; error: Error | null }> {
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}.${fileExt}`
      // Store files in user-specific folder: userId/filename
      const filePath = `${userId}/${fileName}`

      console.log('Uploading PDF:', {
        userId,
        fileName,
        filePath,
        fileSize: file.size,
        fileType: file.type
      })

      const { data, error: uploadError } = await supabase.storage
        .from('pdfs')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        })

      if (uploadError) {
        console.error('Storage upload error:', uploadError)
        console.error('Error details:', {
          message: uploadError.message,
          name: uploadError.name
        })
        return { path: '', error: new Error(uploadError.message) }
      }

      console.log('PDF uploaded successfully:', data)
      // Return the full path including bucket name for database storage
      return { path: filePath, error: null }
    } catch (err) {
      console.error('Exception in uploadPDF:', err)
      return {
        path: '',
        error: err instanceof Error ? err : new Error('Failed to upload PDF'),
      }
    }
  },

  // Save PDF record to database
  async savePDFRecord(record: PDFRecord): Promise<{ data: PDFRecord | null; error: Error | null }> {
    try {
      const { data, error } = await supabase
        .from('user_pdfs')
        .insert([record])
        .select()
        .single()

      if (error) {
        return { data: null, error: new Error(error.message) }
      }

      return { data: data as PDFRecord, error: null }
    } catch (err) {
      return {
        data: null,
        error: err instanceof Error ? err : new Error('Failed to save PDF record'),
      }
    }
  },

  // Get all PDFs for a user
  async getUserPDFs(userId: string): Promise<{ data: PDFRecord[] | null; error: Error | null }> {
    try {
      console.log('Fetching PDFs for user:', userId)
      
      const { data, error } = await supabase
        .from('user_pdfs')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Supabase query error:', error)
        console.error('Error code:', error.code)
        console.error('Error message:', error.message)
        console.error('Error details:', error.details)
        console.error('Error hint:', error.hint)
        return { data: null, error: new Error(`${error.message} (Code: ${error.code})`) }
      }

      console.log('PDFs fetched successfully:', data?.length || 0, 'PDF(s)')
      if (data && data.length > 0) {
        console.log('PDF records:', data)
      }

      return { data: data as PDFRecord[], error: null }
    } catch (err) {
      console.error('Exception in getUserPDFs:', err)
      return {
        data: null,
        error: err instanceof Error ? err : new Error('Failed to fetch PDFs'),
      }
    }
  },

  // Get PDF download URL (signed URL for private buckets)
  async getPDFUrl(filePath: string): Promise<{ url: string | null; error: Error | null }> {
    try {
      console.log('Getting PDF URL for:', filePath)
      
      // For private buckets, we need to create a signed URL
      // Signed URLs expire after 1 hour (3600 seconds)
      const { data, error } = await supabase.storage
        .from('pdfs')
        .createSignedUrl(filePath, 3600) // Valid for 1 hour

      if (error) {
        console.error('Error creating signed URL:', error)
        // Fallback to public URL if signed URL fails
        const { data: publicData } = await supabase.storage.from('pdfs').getPublicUrl(filePath)
        if (publicData) {
          console.log('Using public URL as fallback')
          return { url: publicData.publicUrl, error: null }
        }
        return { url: null, error: new Error(error.message) }
      }

      console.log('Signed URL created successfully')
      return { url: data.signedUrl, error: null }
    } catch (err) {
      console.error('Exception in getPDFUrl:', err)
      return {
        url: null,
        error: err instanceof Error ? err : new Error('Failed to get PDF URL'),
      }
    }
  },

  // Delete PDF and its record
  async deletePDF(pdfId: string, filePath: string): Promise<{ error: Error | null }> {
    try {
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('pdfs')
        .remove([filePath])

      if (storageError) {
        return { error: new Error(storageError.message) }
      }

      // Delete from database
      const { error: dbError } = await supabase
        .from('user_pdfs')
        .delete()
        .eq('id', pdfId)

      if (dbError) {
        return { error: new Error(dbError.message) }
      }

      return { error: null }
    } catch (err) {
      return {
        error: err instanceof Error ? err : new Error('Failed to delete PDF'),
      }
    }
  },
}
