"use client"

import { useRouter } from "next/navigation"
import CreateCaseForm from "@/components/cases/CreateCaseForm"

export default function NewCasePage() {
  const router = useRouter()

  const handleClose = () => {
    router.push("/dashboard/cases")
  }

  const handleCaseCreated = () => {
    router.push("/dashboard/cases")
  }

  return (
    <CreateCaseForm 
      onClose={handleClose}
      onCaseCreated={handleCaseCreated}
    />
  )
}
