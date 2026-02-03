import { useState, useEffect } from 'react'
import { useJobs, useCustomers } from '@/hooks/use-database'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Plus, Eye, ClockCounterClockwise, Trash, CaretUp, CaretDown } from '@phosphor-icons/react'
import { Job, Customer } from '@/lib/types'
import { toast } from 'sonner'

type SortField = 'jobNumber' | 'customer' | 'contactPerson' | 'description' | 'address'
type SortDirection = 'asc' | 'desc'

export function AuftraegePage() {
  const { jobs, createJob: addJobToDb, updateJob, deleteJob: removeJobFromDb, setJobs } = useJobs()
  const { customers, createCustomer: addCustomer, setCustomers } = useCustomers()
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [selectedJob, setSelectedJob] = useState<Job | null>(null)
  const [jobToDelete, setJobToDelete] = useState<Job | null>(null)
  const [filterProvider, setFilterProvider] = useState('alle')
  const [isAddCustomerDialogOpen, setIsAddCustomerDialogOpen] = useState(false)
  const [isAddContactPersonDialogOpen, setIsAddContactPersonDialogOpen] = useState(false)
  const [showNoContactPersonWarning, setShowNoContactPersonWarning] = useState(false)
  const [sortField, setSortField] = useState<SortField>('jobNumber')
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc')

  const [newJob, setNewJob] = useState({
    jobNumber: '',
    customerId: '',
    contactPersonId: '',
    street: '',
    postalCode: '',
    description: ''
  })

  const [newCustomer, setNewCustomer] = useState({
    name: '',
    street: '',
    postalCode: '',
    reportForm: 'Tagesbericht' as 'Tagesbericht' | 'Leistungsbericht',
    contactPersons: [{ name: '', phone: '+49', email: '' }]
  })

  const [newContactPerson, setNewContactPerson] = useState({
    name: '',
    phone: '+49',
    email: ''
  })

  const generateJobNumber = () => {
    const currentYear = new Date().getFullYear()
    const jobsThisYear = (jobs || []).filter(job => 
      job.jobNumber.startsWith(`${currentYear}_`)
    )
    const nextNumber = jobsThisYear.length + 1
    return `${currentYear}_${String(nextNumber).padStart(2, '0')}`
  }

  useEffect(() => {
    if (isAddDialogOpen) {
      const jobNumber = generateJobNumber()
      setNewJob(prev => ({ ...prev, jobNumber }))
    }
  }, [isAddDialogOpen, jobs])

  const selectedCustomer = customers?.find(c => c.id === newJob.customerId)
  const availableContactPersons = selectedCustomer?.contactPersons || []

  const handleAddJob = () => {
    if (!newJob.customerId) {
      toast.error('Bitte wählen Sie einen Auftraggeber aus')
      return
    }

    if (!newJob.contactPersonId) {
      setShowNoContactPersonWarning(true)
      return
    }

    createJob()
  }

  const createJob = () => {
    const job: Job = {
      id: `job_${Date.now()}`,
      jobNumber: newJob.jobNumber || generateJobNumber(),
      customerId: newJob.customerId,
      contactPersonId: newJob.contactPersonId || '',
      street: newJob.street,
      postalCode: newJob.postalCode,
      description: newJob.description,
      status: 'offen',
      createdAt: new Date().toISOString()
    }

    setJobs(currentJobs => [...(currentJobs || []), job])
    setNewJob({
      jobNumber: '',
      customerId: '',
      contactPersonId: '',
      street: '',
      postalCode: '',
      description: ''
    })
    setIsAddDialogOpen(false)
    toast.success('Auftrag erfolgreich hinzugefügt')
  }

  const handleAddContactPerson = () => {
    setNewCustomer({
      ...newCustomer,
      contactPersons: [...newCustomer.contactPersons, { name: '', phone: '+49', email: '' }]
    })
  }

  const handleRemoveContactPerson = (index: number) => {
    const updated = newCustomer.contactPersons.filter((_, i) => i !== index)
    setNewCustomer({ ...newCustomer, contactPersons: updated })
  }

  const handleUpdateContactPerson = (index: number, field: string, value: string) => {
    const updated = newCustomer.contactPersons.map((cp, i) => 
      i === index ? { ...cp, [field]: value } : cp
    )
    setNewCustomer({ ...newCustomer, contactPersons: updated })
  }

  const handleAddCustomer = () => {
    if (!newCustomer.name) {
      toast.error('Bitte geben Sie einen Namen ein')
      return
    }

    const hasContactPerson = newCustomer.contactPersons.some(cp => cp.name.trim() !== '')

    if (!hasContactPerson) {
      setShowNoContactPersonWarning(true)
      return
    }

    proceedWithCustomerCreation()
  }

  const proceedWithCustomerCreation = () => {
    const customer: Customer = {
      id: `customer_${Date.now()}`,
      name: newCustomer.name,
      street: newCustomer.street || undefined,
      postalCode: newCustomer.postalCode || undefined,
      reportForm: newCustomer.reportForm,
      contactPersons: newCustomer.contactPersons.map((cp, idx) => ({
        id: `contact_${Date.now()}_${idx}`,
        name: cp.name,
        phone: cp.phone || undefined,
        email: cp.email || undefined
      })).filter(cp => cp.name.trim() !== ''),
      createdAt: new Date().toISOString()
    }

    setCustomers(current => [...(current || []), customer])
    
    setNewJob({ ...newJob, customerId: customer.id, contactPersonId: customer.contactPersons[0]?.id || '' })
    
    setNewCustomer({
      name: '',
      street: '',
      postalCode: '',
      reportForm: 'Tagesbericht',
      contactPersons: [{ name: '', phone: '+49', email: '' }]
    })
    setIsAddCustomerDialogOpen(false)
    setShowNoContactPersonWarning(false)
    toast.success('Auftraggeber erfolgreich hinzugefügt')
  }

  const handleAddContactPersonToCustomer = () => {
    if (!newContactPerson.name) {
      toast.error('Bitte geben Sie einen Namen ein')
      return
    }

    if (!newJob.customerId) {
      toast.error('Bitte wählen Sie zuerst einen Auftraggeber aus')
      return
    }

    const contactPerson = {
      id: `contact_${Date.now()}`,
      name: newContactPerson.name,
      phone: newContactPerson.phone || undefined,
      email: newContactPerson.email || undefined
    }

    setCustomers(current => 
      (current || []).map(customer => {
        if (customer.id === newJob.customerId) {
          return {
            ...customer,
            contactPersons: [...customer.contactPersons, contactPerson]
          }
        }
        return customer
      })
    )

    setNewJob({ ...newJob, contactPersonId: contactPerson.id })
    
    setNewContactPerson({
      name: '',
      phone: '+49',
      email: ''
    })
    setIsAddContactPersonDialogOpen(false)
    toast.success('Ansprechpartner erfolgreich hinzugefügt')
  }

  const handleDeleteJob = () => {
    if (!jobToDelete) return

    setJobs(current => (current || []).filter(j => j.id !== jobToDelete.id))
    toast.success('Auftrag gelöscht')
    setJobToDelete(null)
  }

  const getCustomerName = (customerId: string) => {
    return customers?.find(c => c.id === customerId)?.name || 'Unbekannt'
  }

  const getContactPersonName = (customerId: string, contactPersonId: string) => {
    const customer = customers?.find(c => c.id === customerId)
    return customer?.contactPersons.find(cp => cp.id === contactPersonId)?.name || 'Unbekannt'
  }

  const getContactPersonDetails = (customerId: string, contactPersonId: string) => {
    const customer = customers?.find(c => c.id === customerId)
    return customer?.contactPersons.find(cp => cp.id === contactPersonId)
  }

  const filteredJobs = (jobs || []).filter(job => {
    if (filterProvider === 'alle') return true
    return job.customerId === filterProvider
  })

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const sortedJobs = [...filteredJobs].sort((a, b) => {
    let aValue = ''
    let bValue = ''

    switch (sortField) {
      case 'jobNumber':
        aValue = a.jobNumber.toLowerCase()
        bValue = b.jobNumber.toLowerCase()
        break
      case 'customer':
        aValue = getCustomerName(a.customerId).toLowerCase()
        bValue = getCustomerName(b.customerId).toLowerCase()
        break
      case 'contactPerson':
        aValue = getContactPersonName(a.customerId, a.contactPersonId).toLowerCase()
        bValue = getContactPersonName(b.customerId, b.contactPersonId).toLowerCase()
        break
      case 'description':
        aValue = (a.description || '').toLowerCase()
        bValue = (b.description || '').toLowerCase()
        break
      case 'address':
        aValue = ((a.postalCode || '') + (a.street || '')).toLowerCase()
        bValue = ((b.postalCode || '') + (b.street || '')).toLowerCase()
        break
    }

    if (sortDirection === 'asc') {
      return aValue.localeCompare(bValue)
    } else {
      return bValue.localeCompare(aValue)
    }
  })

  return (
    <div className="flex-1 flex flex-col bg-background">
      <div className="flex-1 p-8 overflow-auto">
        <div className="max-w-[1600px] mx-auto">
          <h1 className="text-3xl font-semibold mb-2 text-foreground">Aufträge</h1>
          <p className="text-muted-foreground mb-6">
            Sie finden hier eine Übersicht über alle Aufträge. Sie können neue Aufträge hinzufügen oder die Filter nutzen um nach bestimmten Aufträgen zu suchen.
          </p>

          <div className="flex items-center gap-4 mb-6">
            <Select value={filterProvider} onValueChange={setFilterProvider}>
              <SelectTrigger className="w-[240px] bg-background">
                <SelectValue placeholder="Auftraggeber auswählen" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="alle">Alle Auftraggeber</SelectItem>
                {(customers || []).map(customer => (
                  <SelectItem key={customer.id} value={customer.id}>
                    {customer.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2 ml-auto">
                  <Plus size={18} weight="bold" />
                  Auftrag hinzufügen
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Neuer Auftrag</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="space-y-2">
                    <Label>Auftragsnummer</Label>
                    <Input
                      value={newJob.jobNumber}
                      onChange={(e) => setNewJob({ ...newJob, jobNumber: e.target.value })}
                      placeholder="z.B. 2024_01"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="customer">Auftraggeber *</Label>
                    <Select 
                      value={newJob.customerId} 
                      onValueChange={(value) => {
                        if (value === 'add-new') {
                          setIsAddCustomerDialogOpen(true)
                        } else {
                          setNewJob({ ...newJob, customerId: value, contactPersonId: '' })
                        }
                      }}
                    >
                      <SelectTrigger id="customer">
                        <SelectValue placeholder="Auftraggeber auswählen" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="add-new" className="text-primary font-medium">
                          <div className="flex items-center gap-2">
                            <Plus size={16} weight="bold" />
                            <span>Auftraggeber hinzufügen</span>
                          </div>
                        </SelectItem>
                        {(!customers || customers.length === 0) ? (
                          <SelectItem value="none" disabled>
                            Keine Kunden vorhanden
                          </SelectItem>
                        ) : (
                          customers.map(customer => (
                            <SelectItem key={customer.id} value={customer.id}>
                              {customer.name}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contactPerson">Ansprechpartner</Label>
                    <Select 
                      value={newJob.contactPersonId} 
                      onValueChange={(value) => {
                        if (value === 'add-new') {
                          setIsAddContactPersonDialogOpen(true)
                        } else {
                          setNewJob({ ...newJob, contactPersonId: value })
                        }
                      }}
                      disabled={!newJob.customerId}
                    >
                      <SelectTrigger id="contactPerson">
                        <SelectValue placeholder={
                          newJob.customerId 
                            ? "Ansprechpartner auswählen" 
                            : "Bitte zuerst Auftraggeber auswählen"
                        } />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="add-new" className="text-primary font-medium">
                          <div className="flex items-center gap-2">
                            <Plus size={16} weight="bold" />
                            <span>Ansprechpartner hinzufügen</span>
                          </div>
                        </SelectItem>
                        {availableContactPersons.map(cp => (
                          <SelectItem key={cp.id} value={cp.id}>
                            {cp.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="street">Straße</Label>
                      <Input
                        id="street"
                        value={newJob.street}
                        onChange={(e) => setNewJob({ ...newJob, street: e.target.value })}
                        placeholder="Straße und Hausnummer"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="postalCode">Postleitzahl</Label>
                      <Input
                        id="postalCode"
                        value={newJob.postalCode}
                        onChange={(e) => setNewJob({ ...newJob, postalCode: e.target.value })}
                        placeholder="PLZ"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Beschreibung</Label>
                    <Textarea
                      id="description"
                      value={newJob.description}
                      onChange={(e) => setNewJob({ ...newJob, description: e.target.value })}
                      placeholder="Beschreibung des Auftrags..."
                      rows={4}
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                    Abbrechen
                  </Button>
                  <Button onClick={handleAddJob}>
                    Hinzufügen
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            <Dialog open={isAddCustomerDialogOpen} onOpenChange={setIsAddCustomerDialogOpen}>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Neuer Auftraggeber</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="customerName">Name *</Label>
                    <Input
                      id="customerName"
                      value={newCustomer.name}
                      onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
                      placeholder="Name des Auftraggebers"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="customerPostalCode">Postleitzahl</Label>
                      <Input
                        id="customerPostalCode"
                        value={newCustomer.postalCode}
                        onChange={(e) => setNewCustomer({ ...newCustomer, postalCode: e.target.value })}
                        placeholder="PLZ"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="customerStreet">Straße</Label>
                      <Input
                        id="customerStreet"
                        value={newCustomer.street}
                        onChange={(e) => setNewCustomer({ ...newCustomer, street: e.target.value })}
                        placeholder="Straße und Hausnummer"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="customerReportForm">Berichtsform</Label>
                    <Select 
                      value={newCustomer.reportForm} 
                      onValueChange={(value: 'Tagesbericht' | 'Leistungsbericht') => 
                        setNewCustomer({ ...newCustomer, reportForm: value })
                      }
                    >
                      <SelectTrigger id="customerReportForm">
                        <SelectValue placeholder="Berichtsform auswählen" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Tagesbericht">Tagesbericht</SelectItem>
                        <SelectItem value="Leistungsbericht">Leistungsbericht</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label>Ansprechpartner</Label>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleAddContactPerson}
                        className="gap-2"
                      >
                        <Plus size={16} />
                        Ansprechpartner hinzufügen
                      </Button>
                    </div>
                    
                    {newCustomer.contactPersons.map((cp, index) => (
                      <div key={index} className="border rounded-lg p-4 space-y-3 relative">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute top-2 right-2 h-8 w-8"
                          onClick={() => handleRemoveContactPerson(index)}
                        >
                          <Trash size={16} />
                        </Button>
                        <div className="space-y-2">
                          <Label htmlFor={`cp-name-${index}`}>Name</Label>
                          <Input
                            id={`cp-name-${index}`}
                            value={cp.name}
                            onChange={(e) => handleUpdateContactPerson(index, 'name', e.target.value)}
                            placeholder="Name des Ansprechpartners"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor={`cp-phone-${index}`}>Telefon</Label>
                            <Input
                              id={`cp-phone-${index}`}
                              value={cp.phone}
                              onChange={(e) => handleUpdateContactPerson(index, 'phone', e.target.value)}
                              placeholder="+49"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor={`cp-email-${index}`}>E-Mail</Label>
                            <Input
                              id={`cp-email-${index}`}
                              type="email"
                              value={cp.email}
                              onChange={(e) => handleUpdateContactPerson(index, 'email', e.target.value)}
                              placeholder="email@example.com"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsAddCustomerDialogOpen(false)}>
                    Abbrechen
                  </Button>
                  <Button onClick={handleAddCustomer}>
                    Hinzufügen
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            <Dialog open={isAddContactPersonDialogOpen} onOpenChange={setIsAddContactPersonDialogOpen}>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Neuer Ansprechpartner</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="newContactName">Name *</Label>
                    <Input
                      id="newContactName"
                      value={newContactPerson.name}
                      onChange={(e) => setNewContactPerson({ ...newContactPerson, name: e.target.value })}
                      placeholder="Name des Ansprechpartners"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="newContactPhone">Telefonnummer</Label>
                    <Input
                      id="newContactPhone"
                      value={newContactPerson.phone}
                      onChange={(e) => setNewContactPerson({ ...newContactPerson, phone: e.target.value })}
                      placeholder="+49 123 456789"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="newContactEmail">E-Mail</Label>
                    <Input
                      id="newContactEmail"
                      type="email"
                      value={newContactPerson.email}
                      onChange={(e) => setNewContactPerson({ ...newContactPerson, email: e.target.value })}
                      placeholder="email@beispiel.de"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsAddContactPersonDialogOpen(false)}>
                    Abbrechen
                  </Button>
                  <Button onClick={handleAddContactPersonToCustomer}>
                    Hinzufügen
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            <AlertDialog open={showNoContactPersonWarning} onOpenChange={setShowNoContactPersonWarning}>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>
                    {isAddCustomerDialogOpen ? 'Kein Ansprechpartner angegeben' : 'Kein Ansprechpartner ausgewählt'}
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    {isAddCustomerDialogOpen 
                      ? 'Sie haben keinen Ansprechpartner angegeben. Es wird empfohlen, mindestens einen Ansprechpartner hinzuzufügen. Möchten Sie den Auftraggeber trotzdem ohne Ansprechpartner erstellen?'
                      : 'Sie haben keinen Ansprechpartner für diesen Auftrag ausgewählt. Möchten Sie den Auftrag trotzdem ohne Ansprechpartner erstellen?'
                    }
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>
                    {isAddCustomerDialogOpen ? 'Zurück' : 'Abbrechen'}
                  </AlertDialogCancel>
                  <AlertDialogAction onClick={() => {
                    setShowNoContactPersonWarning(false)
                    if (isAddCustomerDialogOpen) {
                      proceedWithCustomerCreation()
                    } else {
                      createJob()
                    }
                  }}>
                    Trotzdem erstellen
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            <AlertDialog open={!!jobToDelete} onOpenChange={() => setJobToDelete(null)}>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Auftrag löschen?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Sind Sie sicher, dass Sie den Auftrag "{jobToDelete?.jobNumber}" löschen möchten? Diese Aktion kann nicht rückgängig gemacht werden.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Abbrechen</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDeleteJob} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                    Löschen
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>

          <div className="bg-card rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="font-semibold">
                    <button 
                      onClick={() => handleSort('jobNumber')}
                      className="flex items-center gap-2 hover:text-foreground transition-colors"
                    >
                      AUFTRAG
                      {sortField === 'jobNumber' && (
                        sortDirection === 'asc' ? <CaretUp size={16} weight="bold" /> : <CaretDown size={16} weight="bold" />
                      )}
                    </button>
                  </TableHead>
                  <TableHead className="font-semibold">
                    <button 
                      onClick={() => handleSort('customer')}
                      className="flex items-center gap-2 hover:text-foreground transition-colors"
                    >
                      AUFTRAGGEBER
                      {sortField === 'customer' && (
                        sortDirection === 'asc' ? <CaretUp size={16} weight="bold" /> : <CaretDown size={16} weight="bold" />
                      )}
                    </button>
                  </TableHead>
                  <TableHead className="font-semibold">
                    <button 
                      onClick={() => handleSort('contactPerson')}
                      className="flex items-center gap-2 hover:text-foreground transition-colors"
                    >
                      ANSPRECHPARTNER
                      {sortField === 'contactPerson' && (
                        sortDirection === 'asc' ? <CaretUp size={16} weight="bold" /> : <CaretDown size={16} weight="bold" />
                      )}
                    </button>
                  </TableHead>
                  <TableHead className="font-semibold">
                    <button 
                      onClick={() => handleSort('description')}
                      className="flex items-center gap-2 hover:text-foreground transition-colors"
                    >
                      BESCHREIBUNG
                      {sortField === 'description' && (
                        sortDirection === 'asc' ? <CaretUp size={16} weight="bold" /> : <CaretDown size={16} weight="bold" />
                      )}
                    </button>
                  </TableHead>
                  <TableHead className="font-semibold">
                    <button 
                      onClick={() => handleSort('address')}
                      className="flex items-center gap-2 hover:text-foreground transition-colors"
                    >
                      ADRESSE
                      {sortField === 'address' && (
                        sortDirection === 'asc' ? <CaretUp size={16} weight="bold" /> : <CaretDown size={16} weight="bold" />
                      )}
                    </button>
                  </TableHead>
                  <TableHead className="w-[100px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedJobs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                      Keine Aufträge vorhanden
                    </TableCell>
                  </TableRow>
                ) : (
                  sortedJobs.map((job) => (
                    <TableRow key={job.id} className="group">
                      <TableCell>
                        <span className="font-medium">{job.jobNumber}</span>
                      </TableCell>
                      <TableCell className="font-medium">{getCustomerName(job.customerId)}</TableCell>
                      <TableCell>
                        {(() => {
                          const cp = getContactPersonDetails(job.customerId, job.contactPersonId)
                          return cp ? (
                            <div>
                              <p className="font-medium">{cp.name}</p>
                              {cp.phone && <p className="text-sm text-muted-foreground">{cp.phone}</p>}
                            </div>
                          ) : (
                            <p>-</p>
                          )
                        })()}
                      </TableCell>
                      <TableCell className="max-w-[300px]">
                        <p className="truncate">{job.description || '-'}</p>
                      </TableCell>
                      <TableCell>
                        {(job.street || job.postalCode) ? (
                          <div>
                            <p className="font-medium">{job.street}</p>
                            {job.postalCode && <p className="text-sm text-muted-foreground">{job.postalCode}</p>}
                          </div>
                        ) : (
                          <p>-</p>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 justify-end">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => setSelectedJob(job)}
                              >
                                <Eye size={18} className="text-blue-600" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                              <DialogHeader>
                                <DialogTitle>Auftragsdetails</DialogTitle>
                              </DialogHeader>
                              {selectedJob && (
                                <div className="space-y-4 py-4">
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <Label className="text-muted-foreground">Auftragsnummer</Label>
                                      <p className="text-lg font-medium">{selectedJob.jobNumber}</p>
                                    </div>
                                    <div>
                                      <Label className="text-muted-foreground">Auftraggeber</Label>
                                      <p className="text-lg font-medium">{getCustomerName(selectedJob.customerId)}</p>
                                    </div>
                                  </div>
                                  <div>
                                    <Label className="text-muted-foreground">Ansprechpartner</Label>
                                    {(() => {
                                      const cp = getContactPersonDetails(selectedJob.customerId, selectedJob.contactPersonId)
                                      return cp ? (
                                        <div>
                                          <p className="font-medium">{cp.name}</p>
                                          {cp.phone && <p className="text-sm">{cp.phone}</p>}
                                          {cp.email && <p className="text-sm">{cp.email}</p>}
                                        </div>
                                      ) : (
                                        <p>Unbekannt</p>
                                      )
                                    })()}
                                  </div>
                                  {(selectedJob.street || selectedJob.postalCode) && (
                                    <div>
                                      <Label className="text-muted-foreground">Adresse</Label>
                                      <p>{selectedJob.street}</p>
                                      {selectedJob.postalCode && <p className="text-sm text-muted-foreground">{selectedJob.postalCode}</p>}
                                    </div>
                                  )}
                                  {selectedJob.description && (
                                    <div>
                                      <Label className="text-muted-foreground">Beschreibung</Label>
                                      <p className="whitespace-pre-wrap">{selectedJob.description}</p>
                                    </div>
                                  )}
                                  <div>
                                    <Label className="text-muted-foreground">Status</Label>
                                    <p className="capitalize">{selectedJob.status.replace('_', ' ')}</p>
                                  </div>
                                </div>
                              )}
                            </DialogContent>
                          </Dialog>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => setJobToDelete(job)}
                          >
                            <Trash size={18} className="text-red-600" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </div>
  )
}
