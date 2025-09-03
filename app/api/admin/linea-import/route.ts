import { NextRequest, NextResponse } from 'next/server'
import { processLineaEligibilityList } from '@/src/server/fetchers/lineaParser'
import { requireAdmin } from '@/src/server/auth'
import fs from 'fs'
import path from 'path'
import os from 'os'

export async function POST(req: NextRequest) {
  try {
    // Verify admin access
    await requireAdmin()
    
    // Get the uploaded file
    const formData = await req.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file uploaded' },
        { status: 400 }
      )
    }
    
    // Create a temporary file to store the uploaded content
    const tempDir = os.tmpdir()
    const tempFilePath = path.join(tempDir, `linea-eligibility-${Date.now()}.txt`)
    
    // Write the file to disk
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    fs.writeFileSync(tempFilePath, buffer)
    
    // Process the file
    const result = await processLineaEligibilityList(tempFilePath)
    
    // Clean up the temporary file
    fs.unlinkSync(tempFilePath)
    
    return NextResponse.json({
      success: true,
      ...result
    })
  } catch (error: any) {
    console.error('Error processing Linea eligibility list:', error)
    return NextResponse.json(
      { 
        error: 'Failed to process Linea eligibility list', 
        message: error.message || String(error),
      },
      { status: 500 }
    )
  }
}