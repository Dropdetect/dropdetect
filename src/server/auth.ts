import { NextRequest } from 'next/server'
import { getSupabaseServerClient } from '@/src/lib/supabaseServer'
import { prisma } from '@/src/server/db'

export async function requireAdmin(req: NextRequest) {
  const supabase = getSupabaseServerClient()
  const { data } = await supabase.auth.getUser()
  const user = data.user
  if (!user?.email) return null
  const admin = await prisma.user.findUnique({ where: { email: user.email } })
  return admin
}


