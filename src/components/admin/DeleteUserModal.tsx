'use client'

import React, { useState } from 'react'
import Modal from '@/components/ui/Modal'

interface DeleteUserModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => Promise<void>
  user: any | null
}

const DeleteUserModal: React.FC<DeleteUserModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  user
}) => {
  const [isDeleting, setIsDeleting] = useState(false)

  const handleConfirm = async () => {
    setIsDeleting(true)
    try {
      await onConfirm()
      onClose()
    } catch (error) {
      console.error('Error deleting user:', error)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Delete User" size="md">
      <div className="space-y-6">
        {/* Warning Icon */}
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
          <svg
            className="h-6 w-6 text-red-600"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
            />
          </svg>
        </div>

        {/* Content */}
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900">
            Delete User Account
          </h3>
          {user && (
            <div className="mt-4 space-y-3">
              <p className="text-sm text-gray-500">
                Are you sure you want to delete the following user account? This action cannot be undone.
              </p>
              
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="text-left space-y-1">
                  <p className="text-sm">
                    <span className="font-medium text-gray-900">Name:</span>{' '}
                    <span className="text-gray-700">{user.name}</span>
                  </p>
                  <p className="text-sm">
                    <span className="font-medium text-gray-900">Email:</span>{' '}
                    <span className="text-gray-700">{user.email}</span>
                  </p>
                  <p className="text-sm">
                    <span className="font-medium text-gray-900">Role:</span>{' '}
                    <span className="text-gray-700">{user.role}</span>
                  </p>
                  <p className="text-sm">
                    <span className="font-medium text-gray-900">Department:</span>{' '}
                    <span className="text-gray-700">{user.department}</span>
                  </p>
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h4 className="text-sm font-medium text-yellow-800">
                      Important Considerations
                    </h4>
                    <div className="mt-1 text-sm text-yellow-700 space-y-1">
                      <p>• If this user has active cases assigned, deletion will fail</p>
                      <p>• All user access will be immediately revoked</p>
                      <p>• User data and activity logs will be permanently removed</p>
                      <p>• This action cannot be undone</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            disabled={isDeleting}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={isDeleting}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:bg-red-400 disabled:cursor-not-allowed"
          >
            {isDeleting ? 'Deleting...' : 'Delete User'}
          </button>
        </div>
      </div>
    </Modal>
  )
}

export default DeleteUserModal