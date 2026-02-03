import { useState } from 'react'
import { useCustomers } from '@/hooks/use-database'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus, Eye, Trash, CaretUp, CaretDown } from '@phosphor-icons/react'
import { Customer, ContactPerson } from '@/lib/types'
import { toast } from 'sonner'

type SortField = 'name' | 'address' | 'reportForm'
type SortDirection = 'asc' | 'desc'

export function KundenPage() {
  const { customers, createCustomer, updateCustomer, deleteCustomer: removeCustomer, setCustomers } = useCustomers()
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [deleteCustomer, setDeleteCustomer] = useState<Customer | null>(null)
  const [sortField, setSortField] = useState<SortField>('name')
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc')
  const [showContactWarning, setShowContactWarning] = useState(false)
  
  const [newCustomer, setNewCustomer] = useState({
    name: '',
    street: '',
    postalCode: '',
    reportForm: 'Tagesbericht' as 'Tagesbericht' | 'Leistungsbericht',
    contactPersons: [{ name: '', phone: '+49', email: '' }]
  })

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
      setShowContactWarning(true)
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
    setNewCustomer({
      name: '',
      street: '',
      postalCode: '',
      reportForm: 'Tagesbericht',
      contactPersons: [{ name: '', phone: '+49', email: '' }]
    })
    setIsAddDialogOpen(false)
    setShowContactWarning(false)
    toast.success('Auftraggeber erfolgreich hinzugefügt')
  }

  const handleDeleteCustomer = () => {
    if (!deleteCustomer) return

    setCustomers(current => (current || []).filter(c => c.id !== deleteCustomer.id))
    toast.success('Auftraggeber gelöscht')
    setDeleteCustomer(null)
  }

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const sortedCustomers = [...(customers || [])].sort((a, b) => {
    let aValue = ''
    let bValue = ''

    switch (sortField) {
      case 'name':
        aValue = a.name.toLowerCase()
        bValue = b.name.toLowerCase()
        break
      case 'address':
        aValue = (a.postalCode || '') + (a.street || '')
        bValue = (b.postalCode || '') + (b.street || '')
        break
      case 'reportForm':
        aValue = a.reportForm || ''
        bValue = b.reportForm || ''
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
          <h1 className="text-3xl font-semibold mb-2 text-foreground">Auftraggeber</h1>
          <p className="text-muted-foreground mb-6">
            In diesem Bereich können Sie die Daten der Auftraggeber verwalten. Sie haben die Möglichkeit, neue Auftraggeber anzulegen, bestehende Daten zu bearbeiten oder nicht mehr aktive Auftraggeber zu archivieren. Bitte stellen Sie sicher, dass alle Eingaben korrekt und aktuell sind, da diese Informationen für die Auftragsabwicklung, Rechnungsstellung und Kommunikation von zentraler Bedeutung sind.
          </p>

          <div className="flex justify-end mb-6">
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus size={18} weight="bold" />
                  Neuen Auftraggeber anlegen
                </Button>
              </DialogTrigger>
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
                      <Label htmlFor="postalCode">Postleitzahl</Label>
                      <Input
                        id="postalCode"
                        value={newCustomer.postalCode}
                        onChange={(e) => setNewCustomer({ ...newCustomer, postalCode: e.target.value })}
                        placeholder="PLZ"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="street">Straße</Label>
                      <Input
                        id="street"
                        value={newCustomer.street}
                        onChange={(e) => setNewCustomer({ ...newCustomer, street: e.target.value })}
                        placeholder="Straße und Hausnummer"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="reportForm">Berichtsform</Label>
                    <Select 
                      value={newCustomer.reportForm} 
                      onValueChange={(value: 'Tagesbericht' | 'Leistungsbericht') => 
                        setNewCustomer({ ...newCustomer, reportForm: value })
                      }
                    >
                      <SelectTrigger id="reportForm">
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
                          <Label htmlFor={`contact-name-${index}`}>Name</Label>
                          <Input
                            id={`contact-name-${index}`}
                            value={cp.name}
                            onChange={(e) => handleUpdateContactPerson(index, 'name', e.target.value)}
                            placeholder="Name des Ansprechpartners"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor={`contact-phone-${index}`}>Telefon</Label>
                            <Input
                              id={`contact-phone-${index}`}
                              value={cp.phone}
                              onChange={(e) => handleUpdateContactPerson(index, 'phone', e.target.value)}
                              placeholder="+49"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor={`contact-email-${index}`}>E-Mail</Label>
                            <Input
                              id={`contact-email-${index}`}
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
                  <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                    Abbrechen
                  </Button>
                  <Button onClick={handleAddCustomer}>
                    Hinzufügen
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="bg-card rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="font-semibold">
                    <button 
                      onClick={() => handleSort('name')}
                      className="flex items-center gap-2 hover:text-foreground transition-colors"
                    >
                      NAME
                      {sortField === 'name' && (
                        sortDirection === 'asc' ? <CaretUp size={16} weight="bold" /> : <CaretDown size={16} weight="bold" />
                      )}
                    </button>
                  </TableHead>
                  <TableHead className="font-semibold">
                    <button 
                      onClick={() => handleSort('address')}
                      className="flex items-center gap-2 hover:text-foreground transition-colors"
                    >
                      ANSCHRIFT
                      {sortField === 'address' && (
                        sortDirection === 'asc' ? <CaretUp size={16} weight="bold" /> : <CaretDown size={16} weight="bold" />
                      )}
                    </button>
                  </TableHead>
                  <TableHead className="font-semibold">
                    <button 
                      onClick={() => handleSort('reportForm')}
                      className="flex items-center gap-2 hover:text-foreground transition-colors"
                    >
                      BERICHTSFORM
                      {sortField === 'reportForm' && (
                        sortDirection === 'asc' ? <CaretUp size={16} weight="bold" /> : <CaretDown size={16} weight="bold" />
                      )}
                    </button>
                  </TableHead>
                  <TableHead className="w-[100px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedCustomers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-12 text-muted-foreground">
                      Keine Auftraggeber vorhanden
                    </TableCell>
                  </TableRow>
                ) : (
                  sortedCustomers.map((customer) => (
                    <TableRow key={customer.id} className="group">
                      <TableCell className="font-medium">{customer.name}</TableCell>
                      <TableCell>
                        {customer.postalCode && customer.street ? (
                          <div>
                            <div>{customer.postalCode} {customer.street?.split(' ')[0]}</div>
                            <div className="text-muted-foreground">{customer.street?.split(' ').slice(1).join(' ')}</div>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {customer.reportForm || <span className="text-muted-foreground">—</span>}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 justify-end">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => setSelectedCustomer(customer)}
                              >
                                <Eye size={18} className="text-blue-600" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                              <DialogHeader>
                                <DialogTitle>Auftraggeber-Details</DialogTitle>
                              </DialogHeader>
                              {selectedCustomer && (
                                <div className="space-y-4 py-4">
                                  <div>
                                    <Label className="text-muted-foreground">Name</Label>
                                    <p className="text-lg font-medium">{selectedCustomer.name}</p>
                                  </div>
                                  {selectedCustomer.postalCode && selectedCustomer.street && (
                                    <div>
                                      <Label className="text-muted-foreground">Anschrift</Label>
                                      <p className="text-lg font-medium">
                                        {selectedCustomer.postalCode} {selectedCustomer.street}
                                      </p>
                                    </div>
                                  )}
                                  {selectedCustomer.reportForm && (
                                    <div>
                                      <Label className="text-muted-foreground">Berichtsform</Label>
                                      <p className="text-lg font-medium">{selectedCustomer.reportForm}</p>
                                    </div>
                                  )}
                                  <div>
                                    <Label className="text-muted-foreground">Ansprechpartner</Label>
                                    <div className="space-y-2 mt-2">
                                      {selectedCustomer.contactPersons.map((cp) => (
                                        <div key={cp.id} className="border rounded-lg p-3">
                                          <p className="font-medium">{cp.name}</p>
                                          {cp.phone && <p className="text-sm text-muted-foreground">{cp.phone}</p>}
                                          {cp.email && <p className="text-sm text-muted-foreground">{cp.email}</p>}
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              )}
                            </DialogContent>
                          </Dialog>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => setDeleteCustomer(customer)}
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

      <AlertDialog open={!!deleteCustomer} onOpenChange={() => setDeleteCustomer(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Auftraggeber löschen?</AlertDialogTitle>
            <AlertDialogDescription>
              Sind Sie sicher, dass Sie den Auftraggeber "{deleteCustomer?.name}" löschen möchten? Diese Aktion kann nicht rückgängig gemacht werden.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteCustomer} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Löschen
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showContactWarning} onOpenChange={setShowContactWarning}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Kein Ansprechpartner angegeben</AlertDialogTitle>
            <AlertDialogDescription>
              Sie haben keinen Ansprechpartner angegeben. Es wird empfohlen, mindestens einen Ansprechpartner hinzuzufügen. Möchten Sie den Auftraggeber trotzdem ohne Ansprechpartner erstellen?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Zurück</AlertDialogCancel>
            <AlertDialogAction onClick={proceedWithCustomerCreation}>
              Trotzdem erstellen
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
