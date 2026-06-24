'use client'

import React, { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import type { Team, TeamMember, TeamInvitation, Group, Client, ClientAssignment } from '@/types/index'

// ---------------------------------------------------------------------------
// Types for API responses
// ---------------------------------------------------------------------------

interface TeamResponse {
  team: Team | null
  members: TeamMember[]
  current_role: 'owner' | 'admin' | 'member'
}

interface GroupClient {
  id: number
  client_id: number
  client_name: string
  client_email: string
}

// ---------------------------------------------------------------------------
// Role badge component
// ---------------------------------------------------------------------------

function RoleBadge({ role }: { role: string }) {
  const styles: Record<string, string> = {
    owner: 'bg-neutral-900 text-white',
    admin: 'bg-primary-600 text-white',
    member: 'bg-neutral-200 text-neutral-700',
  }
  return (
    <span className={`text-[11px] font-semibold uppercase px-2 py-0.5 rounded-full ${styles[role] ?? styles.member}`}>
      {role}
    </span>
  )
}

// ---------------------------------------------------------------------------
// Confirmation dialog
// ---------------------------------------------------------------------------

function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel,
  onConfirm,
  onCancel,
  loading,
}: {
  open: boolean
  title: string
  message: string
  confirmLabel?: string
  onConfirm: () => void
  onCancel: () => void
  loading?: boolean
}) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="bg-white rounded-card border border-neutral-200 shadow-xl p-6 max-w-sm w-full mx-4">
        <h3 className="text-body-md font-semibold text-neutral-900 mb-2">{title}</h3>
        <p className="text-[13px] text-neutral-500 mb-5">{message}</p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            disabled={loading}
            className="px-4 py-[10px] text-[13px] font-medium border border-neutral-300 rounded-[9px] hover:bg-neutral-50 transition cursor-pointer disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="bg-danger-600 text-white text-[13px] font-semibold px-[18px] py-[10px] rounded-[9px] hover:bg-danger-700 transition cursor-pointer disabled:opacity-50"
          >
            {loading ? 'Removing...' : confirmLabel ?? 'Remove'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------

export default function TeamPage() {
  const { user, loading: authLoading } = useAuth(true)

  // Core state
  const [teamData, setTeamData] = useState<TeamResponse | null>(null)
  const [invitations, setInvitations] = useState<TeamInvitation[]>([])
  const [groups, setGroups] = useState<Group[]>([])
  const [assignments, setAssignments] = useState<ClientAssignment[]>([])
  const [allClients, setAllClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)

  // UI state
  const [toast, setToast] = useState<string | null>(null)

  // Team creation
  const [teamName, setTeamName] = useState('')
  const [creatingTeam, setCreatingTeam] = useState(false)
  const [editingTeamName, setEditingTeamName] = useState(false)
  const [editTeamName, setEditTeamName] = useState('')

  // Invite
  const [showInviteForm, setShowInviteForm] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState<'admin' | 'member'>('member')
  const [inviting, setInviting] = useState(false)

  // Groups
  const [expandedGroup, setExpandedGroup] = useState<number | null>(null)
  const [groupClients, setGroupClients] = useState<GroupClient[]>([])
  const [groupMembers, setGroupMembers] = useState<TeamMember[]>([])
  const [showCreateGroup, setShowCreateGroup] = useState(false)
  const [newGroupName, setNewGroupName] = useState('')
  const [creatingGroup, setCreatingGroup] = useState(false)
  const [addingGroupMember, setAddingGroupMember] = useState(false)
  const [addingGroupClient, setAddingGroupClient] = useState(false)
  const [selectedGroupMemberId, setSelectedGroupMemberId] = useState('')
  const [selectedGroupClientId, setSelectedGroupClientId] = useState('')

  // Assignments
  const [showAssignForm, setShowAssignForm] = useState(false)
  const [assignMemberId, setAssignMemberId] = useState('')
  const [assignClientId, setAssignClientId] = useState('')
  const [assigning, setAssigning] = useState(false)

  // Confirmation
  const [confirm, setConfirm] = useState<{
    open: boolean; title: string; message: string; confirmLabel?: string; action: () => Promise<void>
  }>({ open: false, title: '', message: '', action: async () => {} })
  const [confirmLoading, setConfirmLoading] = useState(false)

  // Role change
  const [changingRole, setChangingRole] = useState<number | null>(null)

  // Loading states for mutations
  const [mutating, setMutating] = useState(false)

  const showToast = (message: string) => {
    setToast(message)
    setTimeout(() => setToast(null), 3000)
  }

  // ---------------------------------------------------------------------------
  // Data fetching
  // ---------------------------------------------------------------------------

  const fetchTeam = useCallback(async () => {
    try {
      const res = await fetch('/api/team')
      if (res.ok) {
        const data: TeamResponse = await res.json()
        setTeamData(data)
      }
    } catch { /* silent */ }
  }, [])

  const fetchInvitations = useCallback(async () => {
    try {
      const res = await fetch('/api/team/invite')
      if (res.ok) {
        const data = await res.json()
        setInvitations(data.invitations ?? data ?? [])
      }
    } catch { /* silent */ }
  }, [])

  const fetchGroups = useCallback(async () => {
    try {
      const res = await fetch('/api/team/groups')
      if (res.ok) {
        const data = await res.json()
        setGroups(data.groups ?? data ?? [])
      }
    } catch { /* silent */ }
  }, [])

  const fetchAssignments = useCallback(async () => {
    try {
      const res = await fetch('/api/team/assignments')
      if (res.ok) {
        const data = await res.json()
        setAssignments(data.assignments ?? data ?? [])
      }
    } catch { /* silent */ }
  }, [])

  const fetchClients = useCallback(async () => {
    try {
      const res = await fetch('/api/clients')
      if (res.ok) {
        const data = await res.json()
        setAllClients(Array.isArray(data) ? data : data.clients ?? [])
      }
    } catch { /* silent */ }
  }, [])

  const fetchGroupDetails = useCallback(async (groupId: number) => {
    try {
      const [membersRes, clientsRes] = await Promise.all([
        fetch(`/api/team/groups/members?group_id=${groupId}`),
        fetch(`/api/team/groups/clients?group_id=${groupId}`),
      ])
      if (membersRes.ok) {
        const data = await membersRes.json()
        setGroupMembers(data.members ?? data ?? [])
      }
      if (clientsRes.ok) {
        const data = await clientsRes.json()
        setGroupClients(data.clients ?? data ?? [])
      }
    } catch { /* silent */ }
  }, [])

  useEffect(() => {
    if (!user) return
    const loadAll = async () => {
      setLoading(true)
      await Promise.all([fetchTeam(), fetchInvitations(), fetchGroups(), fetchAssignments(), fetchClients()])
      setLoading(false)
    }
    void loadAll()
  }, [user, fetchTeam, fetchInvitations, fetchGroups, fetchAssignments, fetchClients])

  useEffect(() => {
    if (expandedGroup) {
      void fetchGroupDetails(expandedGroup)
    }
  }, [expandedGroup, fetchGroupDetails])

  // ---------------------------------------------------------------------------
  // Derived state
  // ---------------------------------------------------------------------------

  const team = teamData?.team ?? null
  const members = teamData?.members ?? []
  const currentRole = teamData?.current_role ?? 'member'
  const isOwner = currentRole === 'owner'
  const isAdmin = currentRole === 'owner' || currentRole === 'admin'

  // ---------------------------------------------------------------------------
  // Actions
  // ---------------------------------------------------------------------------

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!teamName.trim()) return
    setCreatingTeam(true)
    try {
      const res = await fetch('/api/team', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: teamName.trim() }),
      })
      if (res.ok) {
        showToast('Team created')
        setTeamName('')
        await fetchTeam()
      } else {
        const data = await res.json()
        showToast(data.error ?? 'Failed to create team')
      }
    } catch {
      showToast('Network error')
    } finally {
      setCreatingTeam(false)
    }
  }

  const handleChangeRole = async (memberId: number, newRole: string) => {
    setChangingRole(memberId)
    try {
      const res = await fetch('/api/team/members', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ member_id: memberId, role: newRole }),
      })
      if (res.ok) {
        showToast('Role updated')
        await fetchTeam()
      } else {
        showToast('Failed to change role')
      }
    } catch {
      showToast('Network error')
    } finally {
      setChangingRole(null)
    }
  }

  const handleRemoveMember = async (memberId: number) => {
    try {
      const res = await fetch('/api/team/members', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ member_id: memberId }),
      })
      if (res.ok) {
        showToast('Member removed')
        await fetchTeam()
      } else {
        showToast('Failed to remove member')
      }
    } catch {
      showToast('Network error')
    }
  }

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inviteEmail.trim()) return
    setInviting(true)
    try {
      const res = await fetch('/api/team/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: inviteEmail.trim(), role: inviteRole }),
      })
      if (res.ok) {
        showToast(`Invitation sent to ${inviteEmail.trim()}`)
        setInviteEmail('')
        setInviteRole('member')
        setShowInviteForm(false)
        await fetchInvitations()
      } else {
        const data = await res.json()
        showToast(data.error ?? 'Failed to send invitation')
      }
    } catch {
      showToast('Network error')
    } finally {
      setInviting(false)
    }
  }

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newGroupName.trim()) return
    setCreatingGroup(true)
    try {
      const res = await fetch('/api/team/groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newGroupName.trim() }),
      })
      if (res.ok) {
        showToast('Group created')
        setNewGroupName('')
        setShowCreateGroup(false)
        await fetchGroups()
      } else {
        showToast('Failed to create group')
      }
    } catch {
      showToast('Network error')
    } finally {
      setCreatingGroup(false)
    }
  }

  const handleDeleteGroup = async (groupId: number) => {
    try {
      const res = await fetch('/api/team/groups', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ group_id: groupId }),
      })
      if (res.ok) {
        showToast('Group deleted')
        if (expandedGroup === groupId) setExpandedGroup(null)
        await fetchGroups()
      } else {
        showToast('Failed to delete group')
      }
    } catch {
      showToast('Network error')
    }
  }

  const handleAddGroupMember = async (groupId: number) => {
    if (!selectedGroupMemberId) return
    setMutating(true)
    try {
      const res = await fetch('/api/team/groups/members', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ group_id: groupId, team_member_id: Number(selectedGroupMemberId) }),
      })
      if (res.ok) {
        showToast('Member added to group')
        setSelectedGroupMemberId('')
        setAddingGroupMember(false)
        await Promise.all([fetchGroupDetails(groupId), fetchGroups()])
      } else {
        showToast('Failed to add member')
      }
    } catch {
      showToast('Network error')
    } finally {
      setMutating(false)
    }
  }

  const handleRemoveGroupMember = async (groupId: number, memberId: number) => {
    try {
      const res = await fetch('/api/team/groups/members', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ group_id: groupId, team_member_id: memberId }),
      })
      if (res.ok) {
        showToast('Member removed from group')
        await Promise.all([fetchGroupDetails(groupId), fetchGroups()])
      } else {
        showToast('Failed to remove member')
      }
    } catch {
      showToast('Network error')
    }
  }

  const handleAddGroupClient = async (groupId: number) => {
    if (!selectedGroupClientId) return
    setMutating(true)
    try {
      const res = await fetch('/api/team/groups/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ group_id: groupId, client_id: Number(selectedGroupClientId) }),
      })
      if (res.ok) {
        showToast('Client added to group')
        setSelectedGroupClientId('')
        setAddingGroupClient(false)
        await Promise.all([fetchGroupDetails(groupId), fetchGroups()])
      } else {
        showToast('Failed to add client')
      }
    } catch {
      showToast('Network error')
    } finally {
      setMutating(false)
    }
  }

  const handleRemoveGroupClient = async (groupId: number, clientId: number) => {
    try {
      const res = await fetch('/api/team/groups/clients', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ group_id: groupId, client_id: clientId }),
      })
      if (res.ok) {
        showToast('Client removed from group')
        await Promise.all([fetchGroupDetails(groupId), fetchGroups()])
      } else {
        showToast('Failed to remove client')
      }
    } catch {
      showToast('Network error')
    }
  }

  const handleAssign = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!assignMemberId || !assignClientId) return
    setAssigning(true)
    try {
      const res = await fetch('/api/team/assignments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ team_member_id: Number(assignMemberId), client_id: Number(assignClientId) }),
      })
      if (res.ok) {
        showToast('Assignment created')
        setAssignMemberId('')
        setAssignClientId('')
        setShowAssignForm(false)
        await fetchAssignments()
      } else {
        showToast('Failed to create assignment')
      }
    } catch {
      showToast('Network error')
    } finally {
      setAssigning(false)
    }
  }

  const handleRemoveAssignment = async (assignmentId: number) => {
    try {
      const res = await fetch('/api/team/assignments', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: assignmentId }),
      })
      if (res.ok) {
        showToast('Assignment removed')
        await fetchAssignments()
      } else {
        showToast('Failed to remove assignment')
      }
    } catch {
      showToast('Network error')
    }
  }

  const executeConfirm = async () => {
    setConfirmLoading(true)
    await confirm.action()
    setConfirmLoading(false)
    setConfirm({ open: false, title: '', message: '', action: async () => {} })
  }

  // ---------------------------------------------------------------------------
  // Guard: auth + role check
  // ---------------------------------------------------------------------------

  if (authLoading) return <LoadingSpinner fullPage />
  if (!user) return null

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Top Navigation */}
      <div className="bg-white border-b border-neutral-200 px-9 py-4.5 flex items-center justify-between mb-8">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-neutral-900 flex items-center justify-center">
              <div className="w-2.5 h-2.5 rounded-sm bg-primary-500"></div>
            </div>
            <span className="text-[16px] font-semibold text-neutral-900">MiddleDoc</span>
          </div>
          <div className="flex gap-6">
            <Link href="/dashboard" className="text-sm text-neutral-500 hover:text-neutral-900 transition">Dashboard</Link>
            <Link href="/dashboard/clients" className="text-sm text-neutral-500 hover:text-neutral-900 transition">Clients</Link>
            <Link href="/dashboard/requests" className="text-sm text-neutral-500 hover:text-neutral-900 transition">Requests</Link>
            <Link href="/dashboard/documents" className="text-sm text-neutral-500 hover:text-neutral-900 transition">Documents</Link>
            <span className="text-sm text-neutral-900 font-semibold">Settings</span>
          </div>
        </div>
        <Link href="/dashboard/settings" className="cursor-pointer">
          <div className="w-8 h-8 rounded-full bg-primary-600 text-white flex items-center justify-center text-xs font-semibold">
            {user.name ? user.name.split(' ').map(n => n[0]).join('') : ''}
          </div>
        </Link>
      </div>

      {/* Content */}
      <div className="px-9 max-w-3xl">
        {/* Back link */}
        <Link href="/dashboard/settings" className="text-primary-600 font-medium text-[13px] mb-6 inline-block hover:text-primary-700">
          &larr; Settings
        </Link>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-h2 font-serif text-neutral-900">Team</h1>
        </div>

        {loading ? (
          <LoadingSpinner />
        ) : !team ? (
          /* --------------------------------------------------------------- */
          /* Section A: Create team                                          */
          /* --------------------------------------------------------------- */
          <div className="bg-white border border-neutral-200 rounded-card p-6 mb-4">
            <h2 className="text-body-md font-semibold text-neutral-900 mb-1">Create your team</h2>
            <p className="text-[13px] text-neutral-500 mb-4">
              Set up a team to invite colleagues, create groups, and manage client access.
            </p>
            <form onSubmit={handleCreateTeam} className="flex items-end gap-3">
              <div className="flex-1">
                <label className="text-[13px] font-semibold text-neutral-700 block mb-[7px]">Team name</label>
                <input
                  type="text"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  placeholder="e.g. Miller & Associates"
                  className="w-full bg-white border border-neutral-300 rounded-[9px] px-[14px] py-[12px] text-[14px] focus:outline-none focus:border-primary-600"
                />
              </div>
              <button
                type="submit"
                disabled={creatingTeam || !teamName.trim()}
                className="bg-primary-600 text-white text-[13px] font-semibold px-[18px] py-[10px] rounded-[9px] hover:bg-primary-700 transition cursor-pointer disabled:opacity-50 whitespace-nowrap"
              >
                {creatingTeam ? 'Creating...' : 'Create team'}
              </button>
            </form>
          </div>
        ) : (
          <>
            {/* --------------------------------------------------------------- */}
            {/* Section A: Team name                                            */}
            {/* --------------------------------------------------------------- */}
            <div className="bg-white border border-neutral-200 rounded-card p-6 mb-4">
              <div className="flex items-center justify-between">
                {editingTeamName ? (
                  <form
                    onSubmit={async (e) => {
                      e.preventDefault()
                      if (!editTeamName.trim()) return
                      setMutating(true)
                      try {
                        const res = await fetch('/api/team', {
                          method: 'PATCH',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ name: editTeamName.trim() }),
                        })
                        if (res.ok) {
                          showToast('Team name updated')
                          setEditingTeamName(false)
                          await fetchTeam()
                        } else {
                          showToast('Failed to update team name')
                        }
                      } catch {
                        showToast('Network error')
                      } finally {
                        setMutating(false)
                      }
                    }}
                    className="flex items-end gap-3 flex-1"
                  >
                    <div className="flex-1">
                      <label className="text-[13px] font-semibold text-neutral-700 block mb-[7px]">Team name</label>
                      <input
                        type="text"
                        value={editTeamName}
                        onChange={(e) => setEditTeamName(e.target.value)}
                        className="w-full bg-white border border-neutral-300 rounded-[9px] px-[14px] py-[12px] text-[14px] focus:outline-none focus:border-primary-600"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={mutating}
                      className="bg-primary-600 text-white text-[13px] font-semibold px-[18px] py-[10px] rounded-[9px] hover:bg-primary-700 transition cursor-pointer disabled:opacity-50"
                    >
                      {mutating ? 'Saving...' : 'Save'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingTeamName(false)}
                      className="px-4 py-[10px] text-[13px] font-medium border border-neutral-300 rounded-[9px] hover:bg-neutral-50 transition cursor-pointer"
                    >
                      Cancel
                    </button>
                  </form>
                ) : (
                  <>
                    <div>
                      <h2 className="text-body-md font-semibold text-neutral-900">{team.name}</h2>
                      <p className="text-[13px] text-neutral-500">{members.length} member{members.length !== 1 ? 's' : ''}</p>
                    </div>
                    {isOwner && (
                      <button
                        onClick={() => { setEditTeamName(team.name); setEditingTeamName(true) }}
                        className="text-[13px] text-primary-600 font-semibold hover:text-primary-700 cursor-pointer"
                      >
                        Edit
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* --------------------------------------------------------------- */}
            {/* Section B: Members                                              */}
            {/* --------------------------------------------------------------- */}
            <div className="bg-white border border-neutral-200 rounded-card p-6 mb-4">
              <h2 className="text-body-md font-semibold text-neutral-900 mb-4">Members</h2>

              {/* Table header */}
              <div className="grid grid-cols-[1fr_1fr_100px_100px] gap-2 px-4 pb-2">
                <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-[0.06em]">Name</span>
                <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-[0.06em]">Email</span>
                <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-[0.06em]">Role</span>
                <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-[0.06em]">Actions</span>
              </div>

              {/* Member rows */}
              {members.map((member) => (
                <div key={member.id} className="grid grid-cols-[1fr_1fr_100px_100px] gap-2 items-center border-b border-paper-rowline px-4 py-3">
                  <span className="text-[13px] text-neutral-900 truncate">{member.name ?? 'Unknown'}</span>
                  <span className="text-[13px] text-neutral-500 truncate">{member.email ?? ''}</span>
                  <div>
                    {isOwner && member.role !== 'owner' && changingRole !== member.id ? (
                      <select
                        value={member.role}
                        onChange={(e) => handleChangeRole(member.id, e.target.value)}
                        className="text-[11px] font-semibold uppercase bg-transparent border border-neutral-200 rounded-full px-2 py-0.5 cursor-pointer focus:outline-none focus:border-primary-600"
                      >
                        <option value="admin">Admin</option>
                        <option value="member">Member</option>
                      </select>
                    ) : changingRole === member.id ? (
                      <span className="text-[11px] text-neutral-400">Updating...</span>
                    ) : (
                      <RoleBadge role={member.role} />
                    )}
                  </div>
                  <div>
                    {isAdmin && member.role !== 'owner' && (
                      <button
                        onClick={() =>
                          setConfirm({
                            open: true,
                            title: 'Remove member',
                            message: `Are you sure you want to remove ${member.name ?? member.email} from the team?`,
                            action: () => handleRemoveMember(member.id),
                          })
                        }
                        className="text-[12px] text-danger-600 hover:text-danger-700 font-medium cursor-pointer"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>
              ))}

              {/* Invite button / form */}
              {isAdmin && (
                <div className="mt-4">
                  {showInviteForm ? (
                    <form onSubmit={handleInvite} className="space-y-3 border border-neutral-200 rounded-[9px] p-4">
                      <h3 className="text-[13px] font-semibold text-neutral-900">Invite a team member</h3>
                      <div className="flex gap-3">
                        <div className="flex-1">
                          <label className="text-[13px] font-semibold text-neutral-700 block mb-[7px]">Email</label>
                          <input
                            type="email"
                            value={inviteEmail}
                            onChange={(e) => setInviteEmail(e.target.value)}
                            placeholder="colleague@firm.com"
                            required
                            className="w-full bg-white border border-neutral-300 rounded-[9px] px-[14px] py-[12px] text-[14px] focus:outline-none focus:border-primary-600"
                          />
                        </div>
                        <div className="w-32">
                          <label className="text-[13px] font-semibold text-neutral-700 block mb-[7px]">Role</label>
                          <select
                            value={inviteRole}
                            onChange={(e) => setInviteRole(e.target.value as 'admin' | 'member')}
                            className="w-full bg-white border border-neutral-300 rounded-[9px] px-[14px] py-[12px] text-[14px] focus:outline-none focus:border-primary-600"
                          >
                            <option value="admin">Admin</option>
                            <option value="member">Member</option>
                          </select>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <button
                          type="submit"
                          disabled={inviting}
                          className="bg-primary-600 text-white text-[13px] font-semibold px-[18px] py-[10px] rounded-[9px] hover:bg-primary-700 transition cursor-pointer disabled:opacity-50"
                        >
                          {inviting ? 'Sending...' : 'Send invitation'}
                        </button>
                        <button
                          type="button"
                          onClick={() => { setShowInviteForm(false); setInviteEmail(''); }}
                          className="px-4 py-[10px] text-[13px] font-medium border border-neutral-300 rounded-[9px] hover:bg-neutral-50 transition cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  ) : (
                    <button
                      onClick={() => setShowInviteForm(true)}
                      className="bg-primary-600 text-white text-[13px] font-semibold px-[18px] py-[10px] rounded-[9px] hover:bg-primary-700 transition cursor-pointer"
                    >
                      Invite member
                    </button>
                  )}
                </div>
              )}

              {/* Pending invitations */}
              {invitations.length > 0 && (
                <div className="mt-5 pt-4 border-t border-neutral-200">
                  <h3 className="text-[13px] font-semibold text-neutral-900 mb-3">Pending invitations</h3>
                  {invitations.map((inv) => (
                    <div key={inv.id} className="flex items-center justify-between py-2">
                      <div>
                        <span className="text-[13px] text-neutral-900">{inv.email}</span>
                        <span className="text-[11px] text-neutral-400 ml-2">({inv.role})</span>
                      </div>
                      <span className="text-[11px] text-neutral-400">
                        Expires {new Date(inv.expires_at).toLocaleDateString()}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* --------------------------------------------------------------- */}
            {/* Section D: Groups                                               */}
            {/* --------------------------------------------------------------- */}
            <div className="bg-white border border-neutral-200 rounded-card p-6 mb-4">
              <h2 className="text-body-md font-semibold text-neutral-900 mb-1">Groups</h2>
              <p className="text-[13px] text-neutral-500 mb-4">Organize members and clients into groups for easier management.</p>

              {groups.length === 0 && !showCreateGroup && (
                <p className="text-[13px] text-neutral-400 mb-4">No groups yet.</p>
              )}

              {groups.map((group) => {
                const isExpanded = expandedGroup === group.id
                return (
                  <div key={group.id} className="border border-neutral-200 rounded-[9px] mb-3">
                    {/* Group header row */}
                    <button
                      onClick={() => {
                        setExpandedGroup(isExpanded ? null : group.id)
                        setAddingGroupMember(false)
                        setAddingGroupClient(false)
                      }}
                      className="w-full flex items-center justify-between px-4 py-3 text-left cursor-pointer hover:bg-neutral-50 transition rounded-[9px]"
                    >
                      <div className="flex items-center gap-3">
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          className={`transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                        >
                          <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <span className="text-[13px] font-semibold text-neutral-900">{group.name}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-[11px] text-neutral-400">
                          {group.member_count ?? 0} member{(group.member_count ?? 0) !== 1 ? 's' : ''},&nbsp;
                          {group.client_count ?? 0} client{(group.client_count ?? 0) !== 1 ? 's' : ''}
                        </span>
                      </div>
                    </button>

                    {/* Expanded content */}
                    {isExpanded && (
                      <div className="px-4 pb-4 space-y-4 border-t border-neutral-200 pt-3">
                        {/* Group members */}
                        <div>
                          <h4 className="text-[11px] font-semibold text-neutral-400 uppercase tracking-[0.06em] mb-2">Members</h4>
                          {groupMembers.length === 0 ? (
                            <p className="text-[12px] text-neutral-400">No members in this group.</p>
                          ) : (
                            groupMembers.map((gm) => (
                              <div key={gm.id} className="flex items-center justify-between py-1.5">
                                <span className="text-[13px] text-neutral-900">{gm.name ?? gm.email ?? 'Unknown'}</span>
                                {isAdmin && (
                                  <button
                                    onClick={() => handleRemoveGroupMember(group.id, gm.id)}
                                    className="text-[12px] text-danger-600 hover:text-danger-700 font-medium cursor-pointer"
                                  >
                                    Remove
                                  </button>
                                )}
                              </div>
                            ))
                          )}
                          {isAdmin && (
                            addingGroupMember ? (
                              <div className="flex items-end gap-2 mt-2">
                                <select
                                  value={selectedGroupMemberId}
                                  onChange={(e) => setSelectedGroupMemberId(e.target.value)}
                                  className="flex-1 bg-white border border-neutral-300 rounded-[9px] px-[14px] py-[10px] text-[13px] focus:outline-none focus:border-primary-600"
                                >
                                  <option value="">Select member</option>
                                  {members.map((m) => (
                                    <option key={m.id} value={m.id}>{m.name ?? m.email}</option>
                                  ))}
                                </select>
                                <button
                                  onClick={() => handleAddGroupMember(group.id)}
                                  disabled={mutating || !selectedGroupMemberId}
                                  className="bg-primary-600 text-white text-[13px] font-semibold px-[14px] py-[10px] rounded-[9px] hover:bg-primary-700 transition cursor-pointer disabled:opacity-50 whitespace-nowrap"
                                >
                                  {mutating ? 'Adding...' : 'Add'}
                                </button>
                                <button
                                  onClick={() => { setAddingGroupMember(false); setSelectedGroupMemberId('') }}
                                  className="px-3 py-[10px] text-[13px] font-medium border border-neutral-300 rounded-[9px] hover:bg-neutral-50 transition cursor-pointer"
                                >
                                  Cancel
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => setAddingGroupMember(true)}
                                className="text-[12px] text-primary-600 hover:text-primary-700 font-semibold mt-2 cursor-pointer"
                              >
                                + Add member
                              </button>
                            )
                          )}
                        </div>

                        {/* Group clients */}
                        <div>
                          <h4 className="text-[11px] font-semibold text-neutral-400 uppercase tracking-[0.06em] mb-2">Clients</h4>
                          {groupClients.length === 0 ? (
                            <p className="text-[12px] text-neutral-400">No clients in this group.</p>
                          ) : (
                            groupClients.map((gc) => (
                              <div key={gc.id} className="flex items-center justify-between py-1.5">
                                <span className="text-[13px] text-neutral-900">{gc.client_name ?? gc.client_email ?? 'Unknown'}</span>
                                {isAdmin && (
                                  <button
                                    onClick={() => handleRemoveGroupClient(group.id, gc.client_id)}
                                    className="text-[12px] text-danger-600 hover:text-danger-700 font-medium cursor-pointer"
                                  >
                                    Remove
                                  </button>
                                )}
                              </div>
                            ))
                          )}
                          {isAdmin && (
                            addingGroupClient ? (
                              <div className="flex items-end gap-2 mt-2">
                                <select
                                  value={selectedGroupClientId}
                                  onChange={(e) => setSelectedGroupClientId(e.target.value)}
                                  className="flex-1 bg-white border border-neutral-300 rounded-[9px] px-[14px] py-[10px] text-[13px] focus:outline-none focus:border-primary-600"
                                >
                                  <option value="">Select client</option>
                                  {allClients.map((c) => (
                                    <option key={c.id} value={c.id}>{c.name} ({c.email})</option>
                                  ))}
                                </select>
                                <button
                                  onClick={() => handleAddGroupClient(group.id)}
                                  disabled={mutating || !selectedGroupClientId}
                                  className="bg-primary-600 text-white text-[13px] font-semibold px-[14px] py-[10px] rounded-[9px] hover:bg-primary-700 transition cursor-pointer disabled:opacity-50 whitespace-nowrap"
                                >
                                  {mutating ? 'Adding...' : 'Add'}
                                </button>
                                <button
                                  onClick={() => { setAddingGroupClient(false); setSelectedGroupClientId('') }}
                                  className="px-3 py-[10px] text-[13px] font-medium border border-neutral-300 rounded-[9px] hover:bg-neutral-50 transition cursor-pointer"
                                >
                                  Cancel
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => setAddingGroupClient(true)}
                                className="text-[12px] text-primary-600 hover:text-primary-700 font-semibold mt-2 cursor-pointer"
                              >
                                + Add client
                              </button>
                            )
                          )}
                        </div>

                        {/* Delete group */}
                        {isAdmin && (
                          <div className="pt-2 border-t border-neutral-100">
                            <button
                              onClick={() =>
                                setConfirm({
                                  open: true,
                                  title: 'Delete group',
                                  message: `Are you sure you want to delete "${group.name}"? Members and clients will not be removed from the team.`,
                                  confirmLabel: 'Delete',
                                  action: () => handleDeleteGroup(group.id),
                                })
                              }
                              className="text-[12px] text-danger-600 hover:text-danger-700 font-medium cursor-pointer"
                            >
                              Delete group
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}

              {/* Create group form */}
              {isAdmin && (
                <div className="mt-3">
                  {showCreateGroup ? (
                    <form onSubmit={handleCreateGroup} className="flex items-end gap-3">
                      <div className="flex-1">
                        <label className="text-[13px] font-semibold text-neutral-700 block mb-[7px]">Group name</label>
                        <input
                          type="text"
                          value={newGroupName}
                          onChange={(e) => setNewGroupName(e.target.value)}
                          placeholder="e.g. Tax Season 2026"
                          className="w-full bg-white border border-neutral-300 rounded-[9px] px-[14px] py-[12px] text-[14px] focus:outline-none focus:border-primary-600"
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={creatingGroup || !newGroupName.trim()}
                        className="bg-primary-600 text-white text-[13px] font-semibold px-[18px] py-[10px] rounded-[9px] hover:bg-primary-700 transition cursor-pointer disabled:opacity-50 whitespace-nowrap"
                      >
                        {creatingGroup ? 'Creating...' : 'Create group'}
                      </button>
                      <button
                        type="button"
                        onClick={() => { setShowCreateGroup(false); setNewGroupName('') }}
                        className="px-4 py-[10px] text-[13px] font-medium border border-neutral-300 rounded-[9px] hover:bg-neutral-50 transition cursor-pointer"
                      >
                        Cancel
                      </button>
                    </form>
                  ) : (
                    <button
                      onClick={() => setShowCreateGroup(true)}
                      className="bg-primary-600 text-white text-[13px] font-semibold px-[18px] py-[10px] rounded-[9px] hover:bg-primary-700 transition cursor-pointer"
                    >
                      Create group
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* --------------------------------------------------------------- */}
            {/* Section E: Direct Assignments                                   */}
            {/* --------------------------------------------------------------- */}
            <div className="bg-white border border-neutral-200 rounded-card p-6 mb-4">
              <h2 className="text-body-md font-semibold text-neutral-900 mb-1">Direct Assignments</h2>
              <p className="text-[13px] text-neutral-500 mb-4">Assign individual team members to specific clients (contractors, seasonal staff, etc.).</p>

              {assignments.length === 0 && !showAssignForm && (
                <p className="text-[13px] text-neutral-400 mb-4">No direct assignments yet.</p>
              )}

              {assignments.length > 0 && (
                <>
                  {/* Table header */}
                  <div className="grid grid-cols-[1fr_1fr_120px_80px] gap-2 px-4 pb-2">
                    <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-[0.06em]">Member</span>
                    <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-[0.06em]">Client</span>
                    <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-[0.06em]">Assigned</span>
                    <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-[0.06em]">Actions</span>
                  </div>
                  {assignments.map((a) => (
                    <div key={a.id} className="grid grid-cols-[1fr_1fr_120px_80px] gap-2 items-center border-b border-paper-rowline px-4 py-3">
                      <span className="text-[13px] text-neutral-900 truncate">{a.member_name ?? 'Unknown'}</span>
                      <span className="text-[13px] text-neutral-900 truncate">{a.client_name ?? 'Unknown'}</span>
                      <span className="text-[12px] text-neutral-400">{new Date(a.assigned_at).toLocaleDateString()}</span>
                      <div>
                        {isAdmin && (
                          <button
                            onClick={() =>
                              setConfirm({
                                open: true,
                                title: 'Remove assignment',
                                message: `Remove ${a.member_name ?? 'this member'} from ${a.client_name ?? 'this client'}?`,
                                action: () => handleRemoveAssignment(a.id),
                              })
                            }
                            className="text-[12px] text-danger-600 hover:text-danger-700 font-medium cursor-pointer"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </>
              )}

              {/* Assign form */}
              {isAdmin && (
                <div className="mt-4">
                  {showAssignForm ? (
                    <form onSubmit={handleAssign} className="space-y-3 border border-neutral-200 rounded-[9px] p-4">
                      <h3 className="text-[13px] font-semibold text-neutral-900">Assign member to client</h3>
                      <div className="flex gap-3">
                        <div className="flex-1">
                          <label className="text-[13px] font-semibold text-neutral-700 block mb-[7px]">Member</label>
                          <select
                            value={assignMemberId}
                            onChange={(e) => setAssignMemberId(e.target.value)}
                            required
                            className="w-full bg-white border border-neutral-300 rounded-[9px] px-[14px] py-[12px] text-[14px] focus:outline-none focus:border-primary-600"
                          >
                            <option value="">Select member</option>
                            {members.map((m) => (
                              <option key={m.id} value={m.id}>{m.name ?? m.email}</option>
                            ))}
                          </select>
                        </div>
                        <div className="flex-1">
                          <label className="text-[13px] font-semibold text-neutral-700 block mb-[7px]">Client</label>
                          <select
                            value={assignClientId}
                            onChange={(e) => setAssignClientId(e.target.value)}
                            required
                            className="w-full bg-white border border-neutral-300 rounded-[9px] px-[14px] py-[12px] text-[14px] focus:outline-none focus:border-primary-600"
                          >
                            <option value="">Select client</option>
                            {allClients.map((c) => (
                              <option key={c.id} value={c.id}>{c.name} ({c.email})</option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <button
                          type="submit"
                          disabled={assigning || !assignMemberId || !assignClientId}
                          className="bg-primary-600 text-white text-[13px] font-semibold px-[18px] py-[10px] rounded-[9px] hover:bg-primary-700 transition cursor-pointer disabled:opacity-50"
                        >
                          {assigning ? 'Assigning...' : 'Assign'}
                        </button>
                        <button
                          type="button"
                          onClick={() => { setShowAssignForm(false); setAssignMemberId(''); setAssignClientId('') }}
                          className="px-4 py-[10px] text-[13px] font-medium border border-neutral-300 rounded-[9px] hover:bg-neutral-50 transition cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  ) : (
                    <button
                      onClick={() => setShowAssignForm(true)}
                      className="bg-primary-600 text-white text-[13px] font-semibold px-[18px] py-[10px] rounded-[9px] hover:bg-primary-700 transition cursor-pointer"
                    >
                      Assign member to client
                    </button>
                  )}
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Confirmation dialog */}
      <ConfirmDialog
        open={confirm.open}
        title={confirm.title}
        message={confirm.message}
        confirmLabel={confirm.confirmLabel}
        onConfirm={executeConfirm}
        onCancel={() => setConfirm({ open: false, title: '', message: '', action: async () => {} })}
        loading={confirmLoading}
      />

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-neutral-900 text-white text-[13px] font-medium px-5 py-3 rounded-[9px] shadow-lg z-50 animate-in fade-in slide-in-from-bottom-2">
          {toast}
        </div>
      )}
    </div>
  )
}
