import express from 'express'
import cors from 'cors'
import pg from 'pg'
import dotenv from 'dotenv'

dotenv.config()

const { Pool } = pg

const app = express()
const port = process.env.PORT || 3001

// PostgreSQL Connection Pool
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'fels_servicebetrieb',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
})

// Middleware
app.use(cors())
app.use(express.json())

// Health Check
app.get('/api/health', async (req, res) => {
  try {
    await pool.query('SELECT 1')
    res.json({ status: 'ok', database: 'connected' })
  } catch (error) {
    res.status(500).json({ status: 'error', database: 'disconnected' })
  }
})

// ============ USERS ============
app.get('/api/users', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM users ORDER BY full_name')
    res.json(result.rows)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

app.get('/api/users/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM users WHERE id = $1', [req.params.id])
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' })
    }
    res.json(result.rows[0])
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

app.post('/api/users', async (req, res) => {
  const { username, password, full_name, role, avatar_url } = req.body
  try {
    const result = await pool.query(
      'INSERT INTO users (username, password, full_name, role, avatar_url) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [username, password, full_name, role || 'Mitarbeiter', avatar_url]
    )
    res.status(201).json(result.rows[0])
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

app.put('/api/users/:id', async (req, res) => {
  const { username, password, full_name, role, avatar_url } = req.body
  try {
    const result = await pool.query(
      'UPDATE users SET username = COALESCE($1, username), password = COALESCE($2, password), full_name = COALESCE($3, full_name), role = COALESCE($4, role), avatar_url = COALESCE($5, avatar_url), updated_at = NOW() WHERE id = $6 RETURNING *',
      [username, password, full_name, role, avatar_url, req.params.id]
    )
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' })
    }
    res.json(result.rows[0])
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

app.delete('/api/users/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM users WHERE id = $1', [req.params.id])
    res.status(204).send()
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

app.post('/api/users/authenticate', async (req, res) => {
  const { username, password } = req.body
  try {
    const result = await pool.query(
      'SELECT * FROM users WHERE username = $1 AND password = $2',
      [username, password]
    )
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }
    res.json(result.rows[0])
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// ============ VEHICLES ============
app.get('/api/vehicles', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM vehicles ORDER BY name')
    res.json(result.rows)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

app.post('/api/vehicles', async (req, res) => {
  const { name, color } = req.body
  try {
    const result = await pool.query(
      'INSERT INTO vehicles (name, color) VALUES ($1, $2) RETURNING *',
      [name, color]
    )
    res.status(201).json(result.rows[0])
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

app.put('/api/vehicles/:id', async (req, res) => {
  const { name, color } = req.body
  try {
    const result = await pool.query(
      'UPDATE vehicles SET name = COALESCE($1, name), color = COALESCE($2, color), updated_at = NOW() WHERE id = $3 RETURNING *',
      [name, color, req.params.id]
    )
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Vehicle not found' })
    }
    res.json(result.rows[0])
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

app.delete('/api/vehicles/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM vehicles WHERE id = $1', [req.params.id])
    res.status(204).send()
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// ============ APPOINTMENTS ============
app.get('/api/appointments', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM appointments ORDER BY start_date')
    res.json(result.rows)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

app.post('/api/appointments', async (req, res) => {
  const { title, location, address, customer, workers, equipment, notes, start_date, end_date, color, all_day, multi_day_group_id, is_first_day, is_last_day, job_group_id } = req.body
  try {
    const result = await pool.query(
      `INSERT INTO appointments (title, location, address, customer, workers, equipment, notes, start_date, end_date, color, all_day, multi_day_group_id, is_first_day, is_last_day, job_group_id) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15) RETURNING *`,
      [title, location, address || '', customer || '', workers || [], equipment || '', notes || '', start_date, end_date, color || '#3b82f6', all_day || false, multi_day_group_id, is_first_day, is_last_day, job_group_id]
    )
    res.status(201).json(result.rows[0])
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

app.post('/api/appointments/bulk', async (req, res) => {
  const appointments = req.body
  try {
    const results = []
    for (const apt of appointments) {
      const result = await pool.query(
        `INSERT INTO appointments (title, location, address, customer, workers, equipment, notes, start_date, end_date, color, all_day, multi_day_group_id, is_first_day, is_last_day, job_group_id) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15) RETURNING *`,
        [apt.title, apt.location, apt.address || '', apt.customer || '', apt.workers || [], apt.equipment || '', apt.notes || '', apt.start_date, apt.end_date, apt.color || '#3b82f6', apt.all_day || false, apt.multi_day_group_id, apt.is_first_day, apt.is_last_day, apt.job_group_id]
      )
      results.push(result.rows[0])
    }
    res.status(201).json(results)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

app.put('/api/appointments/:id', async (req, res) => {
  const { title, location, address, customer, workers, equipment, notes, start_date, end_date, color, all_day, multi_day_group_id, is_first_day, is_last_day, job_group_id } = req.body
  try {
    const result = await pool.query(
      `UPDATE appointments SET 
        title = COALESCE($1, title), location = COALESCE($2, location), address = COALESCE($3, address), 
        customer = COALESCE($4, customer), workers = COALESCE($5, workers), equipment = COALESCE($6, equipment), 
        notes = COALESCE($7, notes), start_date = COALESCE($8, start_date), end_date = COALESCE($9, end_date), 
        color = COALESCE($10, color), all_day = COALESCE($11, all_day), multi_day_group_id = $12, 
        is_first_day = $13, is_last_day = $14, job_group_id = $15, updated_at = NOW() 
       WHERE id = $16 RETURNING *`,
      [title, location, address, customer, workers, equipment, notes, start_date, end_date, color, all_day, multi_day_group_id, is_first_day, is_last_day, job_group_id, req.params.id]
    )
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Appointment not found' })
    }
    res.json(result.rows[0])
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

app.delete('/api/appointments/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM appointments WHERE id = $1', [req.params.id])
    res.status(204).send()
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

app.delete('/api/appointments/group/:groupId', async (req, res) => {
  try {
    await pool.query('DELETE FROM appointments WHERE multi_day_group_id = $1', [req.params.groupId])
    res.status(204).send()
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// ============ CUSTOMERS ============
app.get('/api/customers', async (req, res) => {
  try {
    const customers = await pool.query('SELECT * FROM customers ORDER BY name')
    const contactPersons = await pool.query('SELECT * FROM contact_persons')
    
    const result = customers.rows.map(customer => ({
      ...customer,
      contact_persons: contactPersons.rows.filter(cp => cp.customer_id === customer.id)
    }))
    res.json(result)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

app.post('/api/customers', async (req, res) => {
  const { name, street, postal_code, report_form, contact_persons } = req.body
  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    
    const customerResult = await client.query(
      'INSERT INTO customers (name, street, postal_code, report_form) VALUES ($1, $2, $3, $4) RETURNING *',
      [name, street, postal_code, report_form]
    )
    const customer = customerResult.rows[0]
    
    const cps = []
    if (contact_persons && contact_persons.length > 0) {
      for (const cp of contact_persons) {
        if (cp.name) {
          const cpResult = await client.query(
            'INSERT INTO contact_persons (customer_id, name, phone, email) VALUES ($1, $2, $3, $4) RETURNING *',
            [customer.id, cp.name, cp.phone, cp.email]
          )
          cps.push(cpResult.rows[0])
        }
      }
    }
    
    await client.query('COMMIT')
    res.status(201).json({ ...customer, contact_persons: cps })
  } catch (error) {
    await client.query('ROLLBACK')
    res.status(500).json({ error: error.message })
  } finally {
    client.release()
  }
})

app.put('/api/customers/:id', async (req, res) => {
  const { name, street, postal_code, report_form } = req.body
  try {
    const result = await pool.query(
      'UPDATE customers SET name = COALESCE($1, name), street = COALESCE($2, street), postal_code = COALESCE($3, postal_code), report_form = COALESCE($4, report_form), updated_at = NOW() WHERE id = $5 RETURNING *',
      [name, street, postal_code, report_form, req.params.id]
    )
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Customer not found' })
    }
    res.json(result.rows[0])
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

app.delete('/api/customers/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM customers WHERE id = $1', [req.params.id])
    res.status(204).send()
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// ============ CONTACT PERSONS ============
app.post('/api/contact-persons', async (req, res) => {
  const { customer_id, name, phone, email } = req.body
  try {
    const result = await pool.query(
      'INSERT INTO contact_persons (customer_id, name, phone, email) VALUES ($1, $2, $3, $4) RETURNING *',
      [customer_id, name, phone, email]
    )
    res.status(201).json(result.rows[0])
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

app.put('/api/contact-persons/:id', async (req, res) => {
  const { name, phone, email } = req.body
  try {
    const result = await pool.query(
      'UPDATE contact_persons SET name = COALESCE($1, name), phone = COALESCE($2, phone), email = COALESCE($3, email), updated_at = NOW() WHERE id = $4 RETURNING *',
      [name, phone, email, req.params.id]
    )
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Contact person not found' })
    }
    res.json(result.rows[0])
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

app.delete('/api/contact-persons/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM contact_persons WHERE id = $1', [req.params.id])
    res.status(204).send()
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// ============ JOBS ============
app.get('/api/jobs', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM jobs ORDER BY created_at DESC')
    res.json(result.rows)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

app.post('/api/jobs', async (req, res) => {
  const { job_number, customer_id, contact_person_id, street, postal_code, description, status } = req.body
  try {
    const result = await pool.query(
      'INSERT INTO jobs (job_number, customer_id, contact_person_id, street, postal_code, description, status) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [job_number, customer_id, contact_person_id, street || '', postal_code || '', description || '', status || 'offen']
    )
    res.status(201).json(result.rows[0])
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

app.put('/api/jobs/:id', async (req, res) => {
  const { job_number, customer_id, contact_person_id, street, postal_code, description, status } = req.body
  try {
    const result = await pool.query(
      'UPDATE jobs SET job_number = COALESCE($1, job_number), customer_id = COALESCE($2, customer_id), contact_person_id = COALESCE($3, contact_person_id), street = COALESCE($4, street), postal_code = COALESCE($5, postal_code), description = COALESCE($6, description), status = COALESCE($7, status), updated_at = NOW() WHERE id = $8 RETURNING *',
      [job_number, customer_id, contact_person_id, street, postal_code, description, status, req.params.id]
    )
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Job not found' })
    }
    res.json(result.rows[0])
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

app.delete('/api/jobs/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM jobs WHERE id = $1', [req.params.id])
    res.status(204).send()
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// ============ ABSENCES ============
app.get('/api/absences', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM absences ORDER BY start_date')
    res.json(result.rows)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

app.post('/api/absences', async (req, res) => {
  const { user_id, start_date, end_date, reason, absence_type, custom_reason, status, requires_approval } = req.body
  try {
    const result = await pool.query(
      'INSERT INTO absences (user_id, start_date, end_date, reason, absence_type, custom_reason, status, requires_approval) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
      [user_id, start_date, end_date, reason || '', absence_type || 'urlaub', custom_reason, status || 'pending', requires_approval ?? true]
    )
    res.status(201).json(result.rows[0])
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

app.put('/api/absences/:id', async (req, res) => {
  const { user_id, start_date, end_date, reason, absence_type, custom_reason, status, requires_approval } = req.body
  try {
    const result = await pool.query(
      'UPDATE absences SET user_id = COALESCE($1, user_id), start_date = COALESCE($2, start_date), end_date = COALESCE($3, end_date), reason = COALESCE($4, reason), absence_type = COALESCE($5, absence_type), custom_reason = $6, status = COALESCE($7, status), requires_approval = COALESCE($8, requires_approval), updated_at = NOW() WHERE id = $9 RETURNING *',
      [user_id, start_date, end_date, reason, absence_type, custom_reason, status, requires_approval, req.params.id]
    )
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Absence not found' })
    }
    res.json(result.rows[0])
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

app.delete('/api/absences/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM absences WHERE id = $1', [req.params.id])
    res.status(204).send()
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// ============ EMERGENCIES ============
app.get('/api/emergencies', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM emergencies ORDER BY created_at DESC')
    res.json(result.rows)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

app.post('/api/emergencies', async (req, res) => {
  const { title, description, priority, status } = req.body
  try {
    const result = await pool.query(
      'INSERT INTO emergencies (title, description, priority, status) VALUES ($1, $2, $3, $4) RETURNING *',
      [title, description || '', priority || 'medium', status || 'open']
    )
    res.status(201).json(result.rows[0])
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

app.put('/api/emergencies/:id', async (req, res) => {
  const { title, description, priority, status } = req.body
  try {
    const result = await pool.query(
      'UPDATE emergencies SET title = COALESCE($1, title), description = COALESCE($2, description), priority = COALESCE($3, priority), status = COALESCE($4, status), updated_at = NOW() WHERE id = $5 RETURNING *',
      [title, description, priority, status, req.params.id]
    )
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Emergency not found' })
    }
    res.json(result.rows[0])
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

app.delete('/api/emergencies/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM emergencies WHERE id = $1', [req.params.id])
    res.status(204).send()
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// ============ SETTINGS ============
app.get('/api/settings/:userId/:key', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT value FROM settings WHERE user_id = $1 AND key = $2',
      [req.params.userId, req.params.key]
    )
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Setting not found' })
    }
    res.json(result.rows[0].value)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

app.put('/api/settings/:userId/:key', async (req, res) => {
  const { value } = req.body
  try {
    const result = await pool.query(
      `INSERT INTO settings (user_id, key, value) VALUES ($1, $2, $3) 
       ON CONFLICT (user_id, key) DO UPDATE SET value = $3, updated_at = NOW() 
       RETURNING *`,
      [req.params.userId, req.params.key, JSON.stringify(value)]
    )
    res.json(result.rows[0])
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Start Server
app.listen(port, '0.0.0.0', () => {
  console.log(`🚀 Fels-Servicebetrieb API läuft auf Port ${port}`)
  console.log(`📊 Datenbank: ${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || '5432'}/${process.env.DB_NAME || 'fels_servicebetrieb'}`)
})
