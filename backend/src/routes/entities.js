import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { DatabaseService } from '../services/database.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const db = DatabaseService.instance;
    const entities = await db.all(`
      SELECT e.*, 
             COUNT(tr.id) as tax_return_count
      FROM entities e
      LEFT JOIN tax_returns tr ON e.id = tr.entity_id
      GROUP BY e.id
      ORDER BY e.created_at DESC
    `);

    const entitiesWithReturns = await Promise.all(
      entities.map(async (entity) => {
        const taxReturns = await db.all(
          'SELECT * FROM tax_returns WHERE entity_id = ? ORDER BY tax_year DESC',
          [entity.id]
        );
        
        return {
          id: entity.id,
          name: entity.name,
          type: entity.type,
          taxReturns: taxReturns
        };
      })
    );

    res.json(entitiesWithReturns);
  } catch (error) {
    console.error('Error fetching entities:', error);
    res.status(500).json({ error: 'Failed to fetch entities' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { name, type } = req.body;
    
    if (!name || !type) {
      return res.status(400).json({ error: 'Name and type are required' });
    }
    
    if (!['Individual', 'Group', 'Trust'].includes(type)) {
      return res.status(400).json({ error: 'Invalid entity type' });
    }

    const db = DatabaseService.instance;
    const id = uuidv4();
    
    await db.run(
      'INSERT INTO entities (id, name, type) VALUES (?, ?, ?)',
      [id, name, type]
    );

    const entity = {
      id,
      name,
      type,
      taxReturns: []
    };

    res.status(201).json(entity);
  } catch (error) {
    console.error('Error creating entity:', error);
    res.status(500).json({ error: 'Failed to create entity' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, type } = req.body;
    
    if (!name || !type) {
      return res.status(400).json({ error: 'Name and type are required' });
    }
    
    if (!['Individual', 'Group', 'Trust'].includes(type)) {
      return res.status(400).json({ error: 'Invalid entity type' });
    }

    const db = DatabaseService.instance;
    const result = await db.run(
      'UPDATE entities SET name = ?, type = ? WHERE id = ?',
      [name, type, id]
    );

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Entity not found' });
    }

    const taxReturns = await db.all(
      'SELECT * FROM tax_returns WHERE entity_id = ? ORDER BY tax_year DESC',
      [id]
    );

    const entity = {
      id,
      name,
      type,
      taxReturns
    };

    res.json(entity);
  } catch (error) {
    console.error('Error updating entity:', error);
    res.status(500).json({ error: 'Failed to update entity' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const db = DatabaseService.instance;

    const result = await db.run('DELETE FROM entities WHERE id = ?', [id]);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Entity not found' });
    }

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting entity:', error);
    res.status(500).json({ error: 'Failed to delete entity' });
  }
});

export default router;