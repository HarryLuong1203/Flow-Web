'use client'

import React, { useState } from 'react'
import { Loader2 } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useGroups } from '@/hooks/useGroups'
import { Sidebar } from '@/components/dashboard/Sidebar'
import { SearchBar } from '@/components/dashboard/SearchBar'
import { GroupBoard } from '@/components/dashboard/GroupBoard'
import { createGroup } from '@/lib/firestore'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function DashboardPage() {
  const { user, loading } = useAuth()
  const groups = useGroups()
  const [activeGroupId, setActiveGroupId] = useState<string | null>(null)
  
  // Dialog state for "empty state" create group
  const [open, setOpen] = useState(false)
  const [groupName, setGroupName] = useState('')
  const [emailsStr, setEmailsStr] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const currentGroupId = activeGroupId || (groups.length > 0 ? groups[0].id : null)
  const currentGroup = groups.find(g => g.id === currentGroupId)

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[calc(100vh-64px)]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!user) {
    return null // Route is likely protected by middleware, but this handles any blip
  }

  const handleCreateGroup = async (name: string, emails: string[]) => {
    if (!user) return
    const id = await createGroup(name, user.uid, user.email || '', emails)
    setActiveGroupId(id)
  }

  const handleEmptyStateSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!groupName.trim()) return
    
    setIsSubmitting(true)
    try {
      const emailList = emailsStr
        .split(',')
        .map((email) => email.trim())
        .filter(Boolean)
        
      await handleCreateGroup(groupName, emailList)
      setOpen(false)
      setGroupName('')
      setEmailsStr('')
    } catch (error) {
      console.error('Failed to create group:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (groups.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[calc(100vh-64px)] space-y-4 px-4 text-center bg-background">
        <div className="max-w-md w-full p-8 border rounded-xl bg-card shadow-sm">
          <h1 className="text-3xl font-bold tracking-tight mb-2">Welcome to Flow!</h1>
          <p className="text-muted-foreground mb-8">
            You don&apos;t have any groups yet. Create your first group to start planning and saving your favorite places.
          </p>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger render={<Button size="lg" className="w-full" />}>
              Create a Group
            </DialogTrigger>
            <DialogContent>
              <form onSubmit={handleEmptyStateSubmit}>
                <DialogHeader>
                  <DialogTitle>Create a New Group</DialogTitle>
                  <DialogDescription>
                    Give your group a name and invite members to collaborate.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4 text-left">
                  <div className="space-y-2">
                    <Label htmlFor="empty-name">Group Name</Label>
                    <Input
                      id="empty-name"
                      placeholder="e.g. Summer Vacation, Weekend Trip"
                      value={groupName}
                      onChange={(e) => setGroupName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="empty-emails">Invite Members (Emails)</Label>
                    <Input
                      id="empty-emails"
                      placeholder="alice@example.com, bob@example.com"
                      value={emailsStr}
                      onChange={(e) => setEmailsStr(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">
                      Separate multiple emails with commas.
                    </p>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting || !groupName.trim()}>
                    {isSubmitting ? 'Creating...' : 'Create Group'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-[calc(100vh-64px)] w-full overflow-hidden">
      <Sidebar 
        groups={groups} 
        activeGroupId={currentGroupId} 
        setActiveGroupId={setActiveGroupId}
        onCreateGroup={handleCreateGroup}
      />
      <main className="flex-1 overflow-y-auto bg-muted/10 relative">
        <div className="max-w-5xl mx-auto p-6 lg:p-10">
          <header className="mb-10 text-center sm:text-left">
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">Explore & Add Places</h1>
            <p className="text-muted-foreground mt-2 text-lg">
              Find and save places to your group board.
            </p>
          </header>
          <SearchBar groups={groups} user={user} />
          {currentGroupId && currentGroup && (
            <div className="mt-10">
              <GroupBoard groupId={currentGroupId} groupName={currentGroup.name} />
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
