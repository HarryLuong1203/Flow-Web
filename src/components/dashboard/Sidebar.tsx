'use client'

import React, { useState } from 'react'
import { Plus, Users, LayoutDashboard, ChevronRight, LogOut, MoreVertical, Settings, Trash, X } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { deleteGroup, removeMemberEmail, addMemberEmail } from '@/lib/firestore'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { Group } from '@/types'

interface SidebarProps {
  groups: Group[]
  activeGroupId: string | null
  setActiveGroupId: (id: string) => void
  onCreateGroup: (name: string, emails: string[]) => Promise<void>
}

function GroupItem({ group, isActive, onClick, user }: { group: Group, isActive: boolean, onClick: () => void, user: any }) {
  const [manageOpen, setManageOpen] = useState(false)
  const [newMemberEmail, setNewMemberEmail] = useState('')
  const [isAddingMember, setIsAddingMember] = useState(false)
  const isOwner = user?.uid === group.createdBy

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this group? All saved places will be lost.')) {
      await deleteGroup(group.id)
    }
  }

  const handleRemoveMember = async (email: string) => {
    if (window.confirm(`Remove ${email} from the group?`)) {
      await removeMemberEmail(group.id, email)
    }
  }

  const handleAddMember = async () => {
    if (!newMemberEmail.trim()) return
    setIsAddingMember(true)
    try {
      await addMemberEmail(group.id, newMemberEmail.trim())
      setNewMemberEmail('')
    } catch (error) {
      console.error('Failed to add member', error)
    } finally {
      setIsAddingMember(false)
    }
  }

  return (
    <>
      <div className={`w-full flex items-center group/item px-2 py-1.5 rounded-md transition-colors ${
        isActive
          ? 'bg-primary text-primary-foreground font-medium'
          : 'hover:bg-muted text-muted-foreground hover:text-foreground'
      }`}>
        <button onClick={onClick} className="flex-1 flex items-center gap-3 px-1 py-1 truncate text-left outline-none">
          <Users className="h-4 w-4 shrink-0" />
          <span className="truncate flex-1">{group.name}</span>
        </button>
        {isOwner && (
          <DropdownMenu>
            <DropdownMenuTrigger render={<Button variant="ghost" size="icon-xs" className={`shrink-0 ${isActive ? 'text-primary-foreground hover:bg-primary-foreground/20' : 'opacity-0 group-hover/item:opacity-100 hover:bg-muted-foreground/20'}`} />}>
              <MoreVertical className="h-4 w-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setManageOpen(true)}>
                <Settings className="h-4 w-4 mr-2" /> Manage Members
              </DropdownMenuItem>
              <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={handleDelete}>
                <Trash className="h-4 w-4 mr-2" /> Delete Group
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {isOwner && (
        <Dialog open={manageOpen} onOpenChange={setManageOpen}>
          <DialogContent>
             <DialogHeader>
                <DialogTitle>Manage Members</DialogTitle>
                <DialogDescription>Add or remove members for {group.name}</DialogDescription>
             </DialogHeader>
             <div className="space-y-4 py-4">
                <div className="flex gap-2">
                  <Input 
                    placeholder="Enter email to invite..." 
                    value={newMemberEmail}
                    onChange={(e) => setNewMemberEmail(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        handleAddMember()
                      }
                    }}
                  />
                  <Button onClick={handleAddMember} disabled={!newMemberEmail.trim() || isAddingMember}>
                    Add
                  </Button>
                </div>
                <div className="pt-2">
                  <h4 className="text-sm font-medium mb-2">Current Members</h4>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                  {group.memberEmails.map(email => (
                    <div key={email} className="flex items-center justify-between p-2 rounded-md border">
                      <span className="text-sm truncate mr-2">{email} {email === user?.email && '(You)'}</span>
                      {email !== user?.email && (
                         <Button variant="ghost" size="icon-sm" onClick={() => handleRemoveMember(email)} className="text-destructive hover:bg-destructive/10 shrink-0">
                            <X className="h-4 w-4" />
                         </Button>
                      )}
                    </div>
                  ))}
                </div>
                </div>
             </div>
             <DialogFooter>
                <Button onClick={() => setManageOpen(false)}>Done</Button>
             </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  )
}

export function Sidebar({ groups, activeGroupId, setActiveGroupId, onCreateGroup }: SidebarProps) {
  const { user, signOut } = useAuth()
  const [open, setOpen] = useState(false)
  const [groupName, setGroupName] = useState('')
  const [emailsStr, setEmailsStr] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!groupName.trim()) return
    
    setIsSubmitting(true)
    try {
      const emailList = emailsStr
        .split(',')
        .map((email) => email.trim())
        .filter(Boolean)
        
      await onCreateGroup(groupName, emailList)
      setOpen(false)
      setGroupName('')
      setEmailsStr('')
    } catch (error) {
      console.error('Failed to create group:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="w-64 border-r bg-background h-[calc(100vh-64px)] flex flex-col">
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <LayoutDashboard className="h-5 w-5" />
          My Groups
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {groups.map((group) => (
          <GroupItem 
            key={group.id} 
            group={group} 
            isActive={activeGroupId === group.id} 
            onClick={() => setActiveGroupId(group.id)} 
            user={user} 
          />
        ))}
      </div>

      <div className="p-4 border-t flex flex-col gap-4">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger render={<Button className="w-full gap-2" />}>
            <Plus className="h-4 w-4" />
            Create a Group
          </DialogTrigger>
          <DialogContent>
            <form onSubmit={handleCreateGroup}>
              <DialogHeader>
                <DialogTitle>Create a New Group</DialogTitle>
                <DialogDescription>
                  Give your group a name and invite members to collaborate.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Group Name</Label>
                  <Input
                    id="name"
                    placeholder="e.g. Summer Vacation, Weekend Trip"
                    value={groupName}
                    onChange={(e) => setGroupName(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="emails">Invite Members (Emails)</Label>
                  <Input
                    id="emails"
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
        <div className="flex items-center gap-2 pt-4 border-t mt-2">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{user?.displayName || 'User'}</p>
            <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
          </div>
          <Button variant="ghost" size="icon" onClick={signOut} title="Sign Out" className="shrink-0 text-muted-foreground hover:text-destructive">
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
