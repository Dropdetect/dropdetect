"use client"
import { useEffect, useState } from 'react'
import { getSupabaseBrowserClient } from '@/src/lib/supabaseClient'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function AdminPage() {
  const supabase = getSupabaseBrowserClient()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [session, setSession] = useState<any>(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session))
  }, [])

  async function handleLogin() {
    await supabase.auth.signInWithPassword({ email, password })
    const { data } = await supabase.auth.getSession()
    setSession(data.session)
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    setSession(null)
  }

  return (
    <div className="p-6 space-y-4">
      {!session ? (
        <div className="max-w-sm space-y-2">
          <h1 className="text-xl font-semibold">Admin Login</h1>
          <Input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <Input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
          <Button onClick={handleLogin}>Login</Button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-semibold">Admin Dashboard</h1>
            <Button variant="secondary" onClick={handleLogout}>Logout</Button>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            <AdminDrops />
            <AdminBanners />
            <AdminSync />
            <AdminFetchDrops />
            <AdminLineaImport />
          </div>
        </div>
      )}
    </div>
  )
}

function AdminDrops() {
  const [drops, setDrops] = useState<any[]>([])
  const [form, setForm] = useState({ name: '', symbol: '', logoUrl: '', claimUrl: '', estValueUSD: 0, status: 'UPCOMING' })

  async function fetchDrops() {
    const res = await fetch('/api/admin/drops')
    if (res.ok) setDrops(await res.json())
  }
  useEffect(() => { fetchDrops() }, [])

  async function saveDrop() {
    const res = await fetch('/api/admin/drops', { method: 'POST', body: JSON.stringify(form) })
    if (res.ok) { setForm({ name: '', symbol: '', logoUrl: '', claimUrl: '', estValueUSD: 0, status: 'UPCOMING' }); await fetchDrops() }
  }

  return (
    <div className="border p-4 rounded">
      <h2 className="font-medium">Drops</h2>
      <div className="grid grid-cols-2 gap-2 mt-2">
        <Input placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <Input placeholder="Symbol" value={form.symbol} onChange={(e) => setForm({ ...form, symbol: e.target.value })} />
        <Input placeholder="Logo URL" value={form.logoUrl} onChange={(e) => setForm({ ...form, logoUrl: e.target.value })} />
        <Input placeholder="Claim URL" value={form.claimUrl} onChange={(e) => setForm({ ...form, claimUrl: e.target.value })} />
        <Input placeholder="Est Value USD" value={form.estValueUSD} onChange={(e) => setForm({ ...form, estValueUSD: Number(e.target.value || 0) })} />
        <Input placeholder="Status (UNCLAIMED/UPCOMING/CLAIMED/EXPIRED)" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} />
      </div>
      <Button className="mt-2" onClick={saveDrop}>Add Drop</Button>
      <ul className="mt-3 space-y-1">
        {drops.map((d) => (
          <li key={d.id} className="text-sm">{d.name} ({d.symbol}) - {d.status}</li>
        ))}
      </ul>
    </div>
  )
}

function AdminBanners() {
  const [banners, setBanners] = useState<any[]>([])
  const [form, setForm] = useState({ imageUrl: '', linkUrl: '' })

  async function fetchBanners() {
    const res = await fetch('/api/admin/banners')
    if (res.ok) setBanners(await res.json())
  }
  useEffect(() => { fetchBanners() }, [])

  async function saveBanner() {
    const res = await fetch('/api/admin/banners', { method: 'POST', body: JSON.stringify(form) })
    if (res.ok) { setForm({ imageUrl: '', linkUrl: '' }); await fetchBanners() }
  }

  return (
    <div className="border p-4 rounded">
      <h2 className="font-medium">Banners</h2>
      <div className="grid grid-cols-2 gap-2 mt-2">
        <Input placeholder="Image URL" value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} />
        <Input placeholder="Link URL" value={form.linkUrl} onChange={(e) => setForm({ ...form, linkUrl: e.target.value })} />
      </div>
      <Button className="mt-2" onClick={saveBanner}>Add Banner</Button>
      <ul className="mt-3 space-y-1">
        {banners.map((b) => (
          <li key={b.id} className="text-sm">{b.imageUrl} {b.linkUrl ? `→ ${b.linkUrl}` : ''}</li>
        ))}
      </ul>
    </div>
  )
}

function AdminSync() {
  const [logs, setLogs] = useState<any[]>([])
  const [running, setRunning] = useState(false)

  async function runSync() {
    setRunning(true)
    const res = await fetch('/api/cron/sync', { method: 'POST', headers: { authorization: `Bearer ${process.env.NEXT_PUBLIC_CRON_SECRET ?? ''}` } })
    if (res.ok) {
      const json = await res.json()
      setLogs(json.logs ?? [])
    }
    setRunning(false)
  }

  return (
    <div className="border p-4 rounded">
      <h2 className="font-medium">Twitter Sync</h2>
      <Button className="mt-2" onClick={runSync} disabled={running}>{running ? 'Syncing...' : 'Sync Twitter'}</Button>
      <div className="text-sm mt-3 space-y-1">
        {logs.map((l, i) => (
          <div key={i}>Source {l.source}: +{l.added} added, {l.updated} updated</div>
        ))}
      </div>
    </div>
  )
}

function AdminFetchDrops() {
  const [fetchLogs, setFetchLogs] = useState<any[]>([])
  const [running, setRunning] = useState(false)
  const [lastFetchLog, setLastFetchLog] = useState<any>(null)
  const [sources, setSources] = useState<any[]>([])

  // Fetch sources and last fetch log on component mount
  useEffect(() => {
    fetchSources()
    fetchLastLog()
  }, [])

  async function fetchSources() {
    try {
      const res = await fetch('/api/admin/sources')
      if (res.ok) {
        const data = await res.json()
        setSources(data)
      }
    } catch (error) {
      console.error('Error fetching sources:', error)
    }
  }

  async function fetchLastLog() {
    try {
      const res = await fetch('/api/admin/fetch-logs')
      if (res.ok) {
        const data = await res.json()
        if (data.length > 0) {
          setLastFetchLog(data[0])
        }
      }
    } catch (error) {
      console.error('Error fetching last log:', error)
    }
  }

  async function runFetch() {
    setRunning(true)
    try {
      const res = await fetch('/api/fetch-drops')
      if (res.ok) {
        const json = await res.json()
        setFetchLogs(json.logs || [])
        // Refresh sources and last log after fetch
        await fetchSources()
        await fetchLastLog()
      }
    } catch (error) {
      console.error('Error fetching drops:', error)
    } finally {
      setRunning(false)
    }
  }

  return (
    <div className="border p-4 rounded">
      <h2 className="font-medium">GitHub Airdrop Fetcher</h2>
      <Button className="mt-2" onClick={runFetch} disabled={running}>
        {running ? 'Fetching...' : 'Fetch Airdrops'}
      </Button>
      
      {lastFetchLog && (
        <div className="mt-3">
          <h3 className="text-sm font-medium">Last Fetch:</h3>
          <p className="text-xs">
            {new Date(lastFetchLog.createdAt).toLocaleString()} - 
            {lastFetchLog.finishedAt ? 
              `Completed (${new Date(lastFetchLog.finishedAt).toLocaleString()})` : 
              'Running...'}
          </p>
          <p className="text-xs">
            Added {lastFetchLog.newDrops || 0} new drops, 
            updated {lastFetchLog.updatedDrops || 0} existing drops
          </p>
        </div>
      )}
      
      {sources.length > 0 && (
        <div className="mt-3">
          <h3 className="text-sm font-medium">Sources:</h3>
          <ul className="text-xs space-y-1">
            {sources.map((source) => (
              <li key={source.id}>
                {source.name} - {source.url}
              </li>
            ))}
          </ul>
        </div>
      )}
      
      {fetchLogs.length > 0 && (
        <div className="mt-3">
          <h3 className="text-sm font-medium">Latest Fetch Results:</h3>
          <ul className="text-xs space-y-1">
            {fetchLogs.map((log, i) => (
              <li key={i}>
                {log.repo}: {log.files} files processed, {log.addresses} addresses found
                {log.errors && <span className="text-red-500"> - Error: {log.errors}</span>}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

function AdminLineaImport() {
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0])
      setError(null)
    }
  }

  async function handleUpload() {
    if (!file) {
      setError('Please select a file first')
      return
    }

    setUploading(true)
    setError(null)
    setResult(null)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const res = await fetch('/api/admin/linea-import', {
        method: 'POST',
        body: formData,
      })

      if (res.ok) {
        const data = await res.json()
        setResult(data)
      } else {
        const errorData = await res.json()
        setError(errorData.message || 'Failed to process file')
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during upload')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="border p-4 rounded">
      <h2 className="font-medium">Linea Eligibility Import</h2>
      <p className="text-xs mt-1 mb-2">
        Upload a text file containing Ethereum addresses (one per line) to import into the Linea airdrop eligibility list.
      </p>
      
      <div className="flex items-center gap-2 mt-2">
        <Input 
          type="file" 
          accept=".txt,.csv,.json" 
          onChange={handleFileChange} 
          disabled={uploading}
        />
        <Button 
          onClick={handleUpload} 
          disabled={!file || uploading}
        >
          {uploading ? 'Uploading...' : 'Upload'}
        </Button>
      </div>
      
      {error && (
        <div className="mt-2 text-sm text-red-500">
          Error: {error}
        </div>
      )}
      
      {result && (
        <div className="mt-2 text-sm">
          <p className="text-green-500">Success!</p>
          <p>Processed {result.addressesProcessed} addresses for {result.dropName} airdrop.</p>
        </div>
      )}
    </div>
  )
}


