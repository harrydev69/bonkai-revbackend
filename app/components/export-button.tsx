"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Download, FileText, Database } from "lucide-react"
import { dataService } from "../services/data-service"
import { toast } from "@/hooks/use-toast"

interface ExportButtonProps {
  data: any[]
  filename: string
  disabled?: boolean
}

export function ExportButton({ data, filename, disabled = false }: ExportButtonProps) {
  const [exporting, setExporting] = useState(false)

  const handleExport = async (format: "csv" | "json") => {
    if (!data.length) {
      toast({
        title: "No Data",
        description: "There's no data to export",
        variant: "destructive",
      })
      return
    }

    setExporting(true)
    try {
      await dataService.exportData(format, data, filename)
      toast({
        title: "Export Successful",
        description: `Data exported as ${format.toUpperCase()} file`,
        variant: "success",
      })
    } catch (error) {
      console.error("Export failed:", error)
      toast({
        title: "Export Failed",
        description: "Failed to export data. Please try again.",
        variant: "destructive",
      })
    } finally {
      setExporting(false)
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" disabled={disabled || exporting}>
          <Download className="w-4 h-4 mr-2" />
          {exporting ? "Exporting..." : "Export"}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem onClick={() => handleExport("csv")}>
          <FileText className="w-4 h-4 mr-2" />
          Export as CSV
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport("json")}>
          <Database className="w-4 h-4 mr-2" />
          Export as JSON
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

