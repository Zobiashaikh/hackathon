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
      const fileName = `${userId}/${Date.now()}.${fileExt}`
      const filePath = `pdfs/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('pdfs')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        })

      if (uploadError) {
        return { path: '', error: new Error(uploadError.message) }
      }

      return { path: filePath, error: null }
    } catch (err) {
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
      const { data, error } = await supabase
        .from('user_pdfs')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error) {
        return { data: null, error: new Error(error.message) }
      }

      return { data: data as PDFRecord[], error: null }
    } catch (err) {
      return {
        data: null,
        error: err instanceof Error ? err : new Error('Failed to fetch PDFs'),
      }
    }
  },

  // Get PDF download URL
  async getPDFUrl(filePath: string): Promise<{ url: string | null; error: Error | null }> {
    try {
      const { data } = await supabase.storage.from('pdfs').getPublicUrl(filePath)
      return { url: data.publicUrl, error: null }
    } catch (err) {
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

