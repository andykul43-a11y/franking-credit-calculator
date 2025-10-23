import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Grid,
  IconButton,
  Chip,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Business as BusinessIcon,
  Person as PersonIcon,
  AccountBalance as TrustIcon,
} from '@mui/icons-material';
import { TaxEntity } from '../types';
import { taxAPI } from '../services/api';

interface EntityManagementProps {
  entities: TaxEntity[];
  onEntityCreated: (entity: TaxEntity) => void;
  onEntityUpdated: (entity: TaxEntity) => void;
  onEntityDeleted: (entityId: string) => void;
}

const EntityManagement: React.FC<EntityManagementProps> = ({
  entities,
  onEntityCreated,
  onEntityUpdated,
  onEntityDeleted,
}) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingEntity, setEditingEntity] = useState<TaxEntity | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    type: 'Individual' as 'Individual' | 'Group' | 'Trust',
  });

  const handleOpenDialog = (entity?: TaxEntity) => {
    if (entity) {
      setEditingEntity(entity);
      setFormData({ name: entity.name, type: entity.type });
    } else {
      setEditingEntity(null);
      setFormData({ name: '', type: 'Individual' });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingEntity(null);
    setFormData({ name: '', type: 'Individual' });
  };

  const handleSubmit = async () => {
    try {
      if (editingEntity) {
        const updated = await taxAPI.updateEntity(editingEntity.id, formData);
        onEntityUpdated(updated);
      } else {
        const created = await taxAPI.createEntity(formData);
        onEntityCreated(created);
      }
      handleCloseDialog();
    } catch (error) {
      console.error('Error saving entity:', error);
    }
  };

  const handleDelete = async (entityId: string) => {
    if (window.confirm('Are you sure you want to delete this entity?')) {
      try {
        await taxAPI.deleteEntity(entityId);
        onEntityDeleted(entityId);
      } catch (error) {
        console.error('Error deleting entity:', error);
      }
    }
  };

  const getEntityIcon = (type: string) => {
    switch (type) {
      case 'Individual':
        return <PersonIcon />;
      case 'Group':
        return <BusinessIcon />;
      case 'Trust':
        return <TrustIcon />;
      default:
        return <PersonIcon />;
    }
  };

  const getEntityColor = (type: string) => {
    switch (type) {
      case 'Individual':
        return 'primary';
      case 'Group':
        return 'secondary';
      case 'Trust':
        return 'success';
      default:
        return 'default';
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Entity Management</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Add Entity
        </Button>
      </Box>

      <Grid container spacing={3}>
        {entities.map((entity) => (
          <Grid item xs={12} md={6} lg={4} key={entity.id}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {getEntityIcon(entity.type)}
                    <Typography variant="h6">{entity.name}</Typography>
                  </Box>
                  <Box>
                    <IconButton onClick={() => handleOpenDialog(entity)} size="small">
                      <EditIcon />
                    </IconButton>
                    <IconButton onClick={() => handleDelete(entity.id)} size="small">
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </Box>
                
                <Chip
                  label={entity.type}
                  color={getEntityColor(entity.type) as any}
                  size="small"
                  sx={{ mb: 2 }}
                />
                
                <Typography variant="body2" color="text.secondary">
                  Tax Returns: {entity.taxReturns?.length || 0}
                </Typography>
                
                {entity.taxReturns && entity.taxReturns.length > 0 && (
                  <Typography variant="body2" color="text.secondary">
                    Latest: {entity.taxReturns[entity.taxReturns.length - 1]?.taxYear || 'N/A'}
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingEntity ? 'Edit Entity' : 'Add New Entity'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <TextField
              fullWidth
              label="Entity Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              sx={{ mb: 3 }}
            />
            
            <FormControl fullWidth>
              <InputLabel>Entity Type</InputLabel>
              <Select
                value={formData.type}
                label="Entity Type"
                onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
              >
                <MenuItem value="Individual">Individual</MenuItem>
                <MenuItem value="Group">Group</MenuItem>
                <MenuItem value="Trust">Trust</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button 
            onClick={handleSubmit} 
            variant="contained"
            disabled={!formData.name.trim()}
          >
            {editingEntity ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default EntityManagement;