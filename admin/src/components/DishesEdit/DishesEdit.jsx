import './DishesEdit.css'
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { DataGrid } from '@mui/x-data-grid';
import {
  TextField,
  Box,
  Button,
  FormControl,
  FormControlLabel,
  IconButton,
  InputLabel,
  Modal,
  Select,
  MenuItem,
  Stack,
  Tooltip,
  Typography,
  Switch,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import Sidebar from '../Sidebar';
import Navbar from '../Navbar';
import { toast } from 'react-toastify';


const CATEGORIES = ['rolls', 'sushi', 'pizza', 'soups', 'bouly', 'fishburger', 'fri', 'combo'];
const MODAL_STYLE = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '90vw',
  maxWidth: 500,
  maxHeight: '95vh',
  bgcolor: 'background.paper',
  p: 4,
  borderRadius: 2,
  overflowY: 'auto',
};
const API_URL = 'http://localhost:4000/api/dish';

const DishesEdit = () => {

  const [rows, setRows] = useState([]);
  const [filterText, setFilterText] = useState('');
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingRow, setEditingRow] = useState(null);
  const [editErrors, setEditErrors] = useState({});
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [errors, setErrors] = useState({});
  const [newDish, setNewDish] = useState({
    name: '',
    description: '',
    weight: '',
    price: '',
    category: '',
    imageFile: null,
    imagePreview: '',
    isActive: true,
    priority: 0,
  });
  const fileInputRef = useRef({});


  useEffect(() => {
    fetchDishes();
  }, []);


  const fetchDishes = () => {
    axios
      .get(`${API_URL}/dishes`)
      .then((res) =>
        setRows(
          res.data.list_of_dishes.map((dish, idx) => ({
            id: dish._id,
            index: idx + 1,
            name: dish.name,
            description: dish.description,
            weight: dish.weight,
            price: dish.price,
            category: dish.category,
            image: dish.image,
            imageUrl: `http://localhost:4000/images/${dish.image}?t=${Date.now()}`,
            isActive: dish.isActive,
            priority: dish.priority ?? 0,
          }))
        )
      )
      .catch((err) => {
        console.error(err);
        toast.error('Błąd podczas pobierania dań');
      });
  };


  const validateDish = (dish) => {
    const errors = {};
    if (!dish.name.trim()) errors.name = 'Nazwa jest wymagana';
    if (!dish.description.trim()) errors.description = 'Opis jest wymagany';
    if (isNaN(dish.weight) || dish.weight <= 0) errors.weight = 'Waga musi być liczbą większą niż 0';
    if (isNaN(dish.price) || dish.price <= 0) errors.price = 'Cena musi być liczbą większą niż 0';
    if (!dish.category || !CATEGORIES.includes(dish.category)) errors.category = 'Wybierz poprawną kategorię';
    if (isNaN(dish.priority) || dish.priority < 0) errors.priority = 'Priorytet musi być równy lub większy niż 0';
    return errors;
  };

  const parseValidationErrors = (error) => {
    const errors = {};
    if (error.response?.data?.error) {
      const message = error.response.data.error;
      const errorMatches = message.match(/(\w+): ([^,]+)(?:,|$)/g);
      if (errorMatches) {
        errorMatches.forEach((match) => {
          const [, field, msg] = match.match(/(\w+): (.+?)(?:,|$)/);
          errors[field] =
            msg.includes('Cast to Number')
              ? `Поле ${field} має бути числом`
              : msg.includes('is not a valid enum value')
              ? `Niepoprawna Kategoria`
              : msg;
        });
      } else {
        errors._message = message;
      }
    } else {
      errors._message = error.message || 'Nieznany błąd';
    }
    return errors;
  };

  const handleEditOpen = (row) => {
    setEditingRow({
      ...row,
      isActive: row.isActive ?? true,
      priority: row.priority ?? 0,
    });
    setEditErrors({});
    setEditModalOpen(true);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditingRow((prev) => ({ ...prev, [name]: value }));
  };

  const handleToggleEditActive = (e) => {
    setEditingRow((prev) => ({ ...prev, isActive: e.target.checked }));
  };

  const handleToggleEditPriority = (e) => {
  setEditingRow((prev) => ({
    ...prev,
    priority: Number(e.target.value),
  }));
  };

  const handleConfirmEdit = async () => {
    const validationErrors = validateDish(editingRow);
    if (Object.keys(validationErrors).length > 0) {
      setEditErrors(validationErrors);
      return;
    }

    try {
      await axios.patch(
        `${API_URL}/update-text/${editingRow.id}`,
        {
          name: editingRow.name,
          description: editingRow.description,
          weight: editingRow.weight,
          price: editingRow.price,
          category: editingRow.category,
          isActive: editingRow.isActive,
          priority: editingRow.priority,
        },
        { headers: { 'Content-Type': 'application/json' } }
      );
      fetchDishes();
      setEditModalOpen(false);
      setEditErrors({});
      toast.success('Danie zostało pomyślnie zaktualizowane');
    } catch (err) {
      const errors = parseValidationErrors(err);
      setEditErrors(errors);
      toast.error(errors._message || 'Błąd podczas aktualizacji dania');
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API_URL}/delete/${id}`);
      setRows((prev) => prev.filter((r) => r.id !== id));
      toast.success('Danie zostało pomyślnie usunięte');
    } catch (err) {
      console.error('Delete error:', err);
      toast.error('Błąd podczas usuwania dania');
    }
  };

  
  const handleImageClick = (id) => {
    fileInputRef.current[id]?.click();
  };

  const handleImageChange = async (e, row) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);
    formData.append('name', row.name);
    formData.append('description', row.description);
    formData.append('weight', row.weight);
    formData.append('price', row.price);
    formData.append('category', row.category);
    formData.append('isActive', row.isActive);

    try {
      await axios.put(`${API_URL}/update/${row.id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      fetchDishes();
      toast.success('Obraz dania został pomyślnie zaktualizowany');
    } catch (err) {
      console.error('Image update error:', err);
      toast.error('Błąd podczas aktualizacji obrazu');
    }
  };

  
  const handleAddOpen = () => {
    setAddModalOpen(true);
    setErrors({});
  };

  const handleAddClose = () => {
    setAddModalOpen(false);
    setNewDish({
      name: '',
      description: '',
      weight: '',
      price: '',
      category: '',
      imageFile: null,
      imagePreview: '',
      isActive: true,
      priority: 0,
    });
    setErrors({});
  };

  const handleNewDishChange = (e) => {
    const { name, value } = e.target;
    setNewDish((prev) => ({ ...prev, [name]: value }));
  };

  const handleToggleNewActive = (e) => {
    setNewDish((prev) => ({ ...prev, isActive: e.target.checked }));
  };

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const preview = URL.createObjectURL(file);
    setNewDish((prev) => ({
      ...prev,
      imageFile: file,
      imagePreview: preview,
    }));
  };

  const handleConfirmAdd = async () => {
    const validationErrors = validateDish(newDish);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      const formData = new FormData();
      formData.append('name', newDish.name);
      formData.append('description', newDish.description);
      formData.append('weight', newDish.weight);
      formData.append('price', newDish.price);
      formData.append('category', newDish.category);
      formData.append('isActive', newDish.isActive);
      formData.append('priority', newDish.priority);
      if (newDish.imageFile) formData.append('image', newDish.imageFile);

      await axios.post(`${API_URL}/add`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      fetchDishes();
      handleAddClose();
      toast.success('Danie zostało pomyślnie dodane');
    } catch (err) {
      const errors = parseValidationErrors(err);
      setErrors(errors);
      toast.error(errors._message || 'Błąd podczas dodawania dania');
    }
  };

  
  const filteredRows = rows.filter((r) =>
    Object.values(r).some((v) => String(v).toLowerCase().includes(filterText.toLowerCase()))
  );

  
  const columns = [
    { field: 'index', headerName: '№', flex: 0.5 },
    { field: 'name', headerName: 'Nazwa', flex: 0.8 },
    { field: 'description', headerName: 'Opis', flex: 1.2 },
    { field: 'weight', headerName: 'Waga', flex: 0.8, headerAlign: 'center', align: 'center' },
    { field: 'price', headerName: 'Cena', flex: 0.8 },
    { field: 'category', headerName: 'Kategoria', flex: 0.8 },
    {
      field: 'isActive',
      headerName: 'Status',
      flex: 0.8,
      renderCell: (params) => (
        <Typography
          sx={{
            color: params.value ? '#2abf2a' : '#bf2a2a',
            fontWeight: 'bold',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100%',
          }}
        >
          {params.value ? 'Aktywna' : 'Nieaktywna'}
        </Typography>
      ),
    },
    {
      field: 'imageUrl',
      headerName: 'Obraz',
      flex: 0.8,
      sortable: false,
      renderCell: (params) => (
        <>
          <img
            src={params.value}
            alt={params.row.name}
            style={{ width: 50, height: 50, objectFit: 'cover', borderRadius: 4, cursor: 'pointer' }}
            onClick={(e) => {
              e.stopPropagation();
              handleImageClick(params.row.id);
            }}
          />
          <input
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            ref={(el) => (fileInputRef.current[params.row.id] = el)}
            onChange={(e) => handleImageChange(e, params.row)}
          />
        </>
      ),
    },
    {
      field: 'edit',
      headerName: 'Edytuj',
      flex: 0.7,
      sortable: false,
      headerAlign: 'center',
      align: 'center',
      renderCell: (params) => (
        <Tooltip title="Edytuj">
          <IconButton
            onClick={(e) => {
              e.stopPropagation();
              handleEditOpen(params.row);
            }}
            sx={{
              color: '#F9FAFB',
              '&:hover': {
                backgroundColor: 'rgba(249, 250, 251, 0.1)',
              },
            }}
          >
            <EditIcon />
          </IconButton>
        </Tooltip>
      ),
    },
    {
      field: 'remove',
      headerName: 'Usuń',
      flex: 0.7,
      sortable: false,
      headerAlign: 'center',
      align: 'center',
      renderCell: (params) => (
        <Tooltip title="Usuń">
          <IconButton
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(params.row.id);
            }}
            color="error"
            sx={{
              '&:hover': {
                backgroundColor: 'rgba(211, 47, 47, 0.1)',
                color: '#D32F2F',
              },
            }}
          >
            <DeleteIcon />
          </IconButton>
        </Tooltip>
      ),
    },
    {
      field: 'priority',
      headerName: 'Priorytet',
      flex: 0.6,
      type: 'number',
      headerAlign: 'center',
      align: 'center',
    },
  ];

  return (
    <div className="flex min-h-screen bg-slate-900">
      <Navbar />
      <Sidebar />
      <main className="w-full bg-slate-800 text-white p-6 mt-18 shadow-2xl rounded-2xl ml-4 mr-4 mb-4">
        <h1 className="text-2xl font-bold text-indigo-300 ml-4">Edytuj Menu</h1>
        <Box sx={{ width: '99%', maxWidth: '100vw', p: 2, boxSizing: 'border-box' }}>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAddOpen}
            sx={{ mb: 2 }}
          >
            Dodaj Nowe Danie
          </Button>

          <Typography variant="body2" sx={{ color: '#94a3b8', ml: 1, mt: -1 }}>
            * Wyższy priorytet jest wyświetlany jako pierwszy w menu.
          </Typography>
          <Typography variant="body2" sx={{ color: '#94a3b8', ml: 1 }}>
            * Aby zaktualizować zdjęcie dania, kliknij na obrazek w tabeli.
          </Typography>

          <TextField
            label="Szukaj"
            variant="outlined"
            size="small"
            fullWidth
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            sx={{
              mb: 2,
              backgroundColor: '#0f172a',
              borderRadius: 1,
              mt: 0.5,
              input: { color: '#ffffff' },
              label: { color: '#ffffff' },
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: '#334155',
              },
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: '#64748b',
              },
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderColor: '#94a3b8',
              },
            }}
          />

          <div
            className="overflow-auto rounded-2xl shadow-xl ring-1 ring-slate-700 custom-scrollbar"
            style={{ height: 600, backgroundColor: '#0F172A', position: 'relative', maxWidth: '100%', width: '100%', padding: 0 }}
          >
            <DataGrid
              rows={filteredRows}
              columns={columns}
              pageSize={10}
              rowsPerPageOptions={[5, 10, 20]}
              checkboxSelection={false}
              disableColumnResize={false}
              autoHeight={false}
              getRowHeight={() => 56}
              getEstimatedRowHeight={() => 56}
              sx={{
                backgroundColor: '#0f172a',
                color: '#f3f6ff',
                fontWeight: 'bold',
                border: 'none',
                borderRadius: 2,
                minWidth: '100%',
                maxWidth: '100%',
                width: '100%',
                '& .MuiDataGrid-root': {
                  backgroundColor: '#0F172A !important',
                },
                '& .MuiDataGrid-columnHeaders': {
                  backgroundColor: '#0F172A !important',
                  color: '#c7d2fe',
                  fontWeight: 'bold',
                },
                '& .MuiDataGrid-columnHeader': {
                  backgroundColor: '#0F172A !important',
                },
                '& .MuiDataGrid-columnHeaderTitle': {
                  color: '#ffffff',
                  fontWeight: 'bold',
                },
                '& .MuiDataGrid-virtualScroller': {
                  backgroundColor: '#0F172A !important',
                },
                '& .MuiDataGrid-virtualScrollerContent': {
                  backgroundColor: '#0F172A !important',
                },
                '& .MuiDataGrid-overlay': {
                  backgroundColor: '#0F172A !important',
                },
                '& .MuiDataGrid-cell': {
                  borderBottom: '1px solid #334155',
                },
                '& .MuiDataGrid-row:nth-of-type(even)': {
                  backgroundColor: '#182130 !important',
                },
                '& .MuiDataGrid-row:nth-of-type(odd)': {
                  backgroundColor: '#212b3d !important',
                },
                '& .MuiDataGrid-row:hover': {
                  backgroundColor: '#334155',
                },
                '& .MuiTablePagination-root': {
                  color: '#ffffff',
                },
              }}
            />
          </div>

          {/* Додати Страву */}
          <Modal
            open={addModalOpen}
            onClose={handleAddClose}
            className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black/30"
          >
            <Box
              sx={{
                width: '95vw',
                maxWidth: 700,
                maxHeight: '90vh',
                bgcolor: '#1e293b',
                color: '#cbd5e1',
                boxShadow: 24,
                borderRadius: 2,
                p: 3,
                overflowY: 'auto',
              }}
            >
              <Stack spacing={2}>
                <Typography variant="h5" sx={{ color: '#a5b4fc', fontWeight: 'bold' }}>
                  Nowe Danie
                </Typography>

                {errors._message && (
                  <Typography color="error" sx={{ mb: 1, backgroundColor: '#1D293D', padding: '4px' }}>
                    {errors._message}
                  </Typography>
                )}

                <TextField
                  name="name"
                  label="Nazwa"
                  value={newDish.name}
                  onChange={handleNewDishChange}
                  fullWidth
                  error={!!errors.name}
                  helperText={errors.name}
                  sx={{
                    backgroundColor: '#0f172a',
                    input: { color: '#ffffff' },
                    label: { color: '#ffffff' },
                    '& .MuiFormHelperText-root': {
                      color: '#f87171',
                      backgroundColor: '#1D293D',
                      padding: '2px 4px',
                      margin: 0,
                    },
                  }}
                />

                <TextField
                  name="description"
                  label="Opis"
                  value={newDish.description}
                  onChange={handleNewDishChange}
                  fullWidth
                  error={!!errors.description}
                  helperText={errors.description}
                  sx={{
                    backgroundColor: '#0f172a',
                    input: { color: '#ffffff' },
                    label: { color: '#ffffff' },
                    '& .MuiFormHelperText-root': {
                      color: '#f87171',
                      backgroundColor: '#1D293D',
                      padding: '2px 4px',
                      margin: 0,
                    },
                  }}
                />

                <Box sx={{ display: 'flex', gap: 1 }}>
                  <TextField
                    name="weight"
                    label="Waga"
                    type="number"
                    value={newDish.weight}
                    onChange={handleNewDishChange}
                    fullWidth
                    inputProps={{ min: 0 }}
                    error={!!errors.weight}
                    helperText={errors.weight}
                    sx={{
                      backgroundColor: '#0f172a',
                      input: { color: '#ffffff' },
                      label: { color: '#ffffff' },
                      '& .MuiFormHelperText-root': {
                        color: '#f87171',
                        backgroundColor: '#1D293D',
                        padding: '2px 4px',
                        margin: 0,
                      },
                    }}
                  />
                  <TextField
                    name="price"
                    label="Cena"
                    type="number"
                    value={newDish.price}
                    onChange={handleNewDishChange}
                    fullWidth
                    inputProps={{ min: 0 }}
                    error={!!errors.price}
                    helperText={errors.price}
                    sx={{
                      backgroundColor: '#0f172a',
                      input: { color: '#ffffff' },
                      label: { color: '#ffffff' },
                      '& .MuiFormHelperText-root': {
                        color: '#f87171',
                        backgroundColor: '#1D293D',
                        padding: '2px 4px',
                        margin: 0,
                      },
                    }}
                  />
                </Box>

                <FormControl
                  fullWidth
                  error={!!errors.category}
                  sx={{
                    backgroundColor: '#1e293b',
                    borderRadius: 2,
                  }}
                >
                  <InputLabel id="category-label" sx={{ color: '#cbd5e1' }}>
                    Kategoria
                  </InputLabel>
                  <Select
                    labelId="category-label"
                    name="category"
                    label="Kategoria"
                    value={newDish.category}
                    onChange={handleNewDishChange}
                    sx={{
                      color: '#e2e8f0',
                      backgroundColor: '#0F172A',
                      '& .MuiSelect-icon': {
                        color: '#94a3b8',
                        backgroundColor: '#1e293b',
                      },
                    }}
                    MenuProps={{
                      PaperProps: {
                        sx: {
                          backgroundColor: '#1e293b',
                          color: '#f1f5f9',
                        },
                      },
                    }}
                  >
                    <MenuItem
                      value=""
                      sx={{
                        backgroundColor: '#1e293b',
                        padding: '8px 12px',
                        fontStyle: 'italic',
                        color: '#94a3b8',
                      }}
                    >
                      <em>Оберіть категорію</em>
                    </MenuItem>
                    {CATEGORIES.map((c) => (
                      <MenuItem
                        key={c}
                        value={c}
                        sx={{
                          backgroundColor: '#1e293b',
                          padding: '8px 12px',
                          color: '#f1f5f9',
                          '&:hover': {
                            backgroundColor: '#334155',
                          },
                        }}
                      >
                        {c}
                      </MenuItem>
                    ))}
                  </Select>
                  {!!errors.category && (
                    <Typography
                      color="error"
                      variant="caption"
                      sx={{
                        backgroundColor: '#1e293b',
                        padding: '4px 8px',
                        borderRadius: 1,
                        marginTop: '4px',
                      }}
                    >
                      {errors.category}
                    </Typography>
                  )}
                </FormControl>

                <TextField
                  name="priority"
                  label="Priorytet"
                  type="number"
                  value={newDish.priority}
                  onChange={(e) =>
                    setNewDish((prev) => ({ ...prev, priority: Number(e.target.value) }))
                  }
                  fullWidth
                  error={!!errors.priority}
                  sx={{
                    backgroundColor: '#0f172a',
                    input: { color: '#ffffff' },
                    label: { color: '#ffffff' },
                    '& .MuiFormHelperText-root': {
                      color: '#f87171',
                      backgroundColor: '#1D293D',
                      padding: '2px 4px',
                      margin: 0,
                    },
                  }}
                />

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <FormControlLabel
                    control={<Switch checked={newDish.isActive} onChange={handleToggleNewActive} />}
                    label={newDish.isActive ? 'Aktywna' : 'Nieaktywna'}
                    sx={{ color: '#cbd5e1' }}
                  />
                  {newDish.imagePreview && (
                    <Box
                      component="img"
                      src={newDish.imagePreview}
                      alt="Прев’ю"
                      sx={{ width: 80, borderRadius: 1, mt: 1 }}
                    />
                  )}
                </Box>

                <Typography variant="body2" color="#cbd5e1" sx={{ fontStyle: 'italic' }}>
                  Nie zapomnij wybrać zdjęcia potrawy w formacie .png lub .jpg.
                </Typography>

                <Button variant="outlined" component="label" sx={{ color: '#cbd5e1', borderColor: '#64748b' }}>
                  Wybierz zdjęcie
                  <input type="file" accept="image/*" hidden onChange={handleImageSelect} />
                </Button>

                <Button variant="contained" onClick={handleConfirmAdd} sx={{ backgroundColor: '#3b82f6' }}>
                  Zatwierdź
                </Button>
              </Stack>
            </Box>
          </Modal>

          
          <Modal
            open={editModalOpen}
            onClose={() => setEditModalOpen(false)}
            className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black/30"
          >
            <Box
              sx={{
                width: '100vw',
                maxWidth: 700,
                maxHeight: '100vh',
                bgcolor: '#1e293b',
                color: '#cbd5e1',
                boxShadow: 24,
                borderRadius: 2,
                p: 3,
                overflowY: 'auto',
              }}
            >
              {editingRow && (
                <Stack spacing={2}>
                  <Typography variant="h5" sx={{ color: '#a5b4fc', fontWeight: 'bold' }}>
                    Edytuj danie
                  </Typography>

                  {editErrors._message && (
                    <Typography color="error" sx={{ mb: 1, backgroundColor: '#1D293D', padding: '4px' }}>
                      {editErrors._message}
                    </Typography>
                  )}

                  <TextField
                    name="name"
                    label="Nazwa"
                    value={editingRow.name}
                    onChange={handleEditChange}
                    fullWidth
                    error={!!editErrors.name}
                    helperText={editErrors.name}
                    sx={{
                      backgroundColor: '#0f172a',
                      input: { color: '#ffffff' },
                      label: { color: '#ffffff' },
                      '& .MuiFormHelperText-root': {
                        color: '#f87171',
                        backgroundColor: '#1D293D',
                        padding: '2px 4px',
                        margin: 0,
                      },
                    }}
                  />

                  <TextField
                    name="description"
                    label="Opis"
                    value={editingRow.description}
                    onChange={handleEditChange}
                    fullWidth
                    error={!!editErrors.description}
                    helperText={editErrors.description}
                    sx={{
                      backgroundColor: '#0f172a',
                      input: { color: '#ffffff' },
                      label: { color: '#ffffff' },
                      '& .MuiFormHelperText-root': {
                        color: '#f87171',
                        backgroundColor: '#1D293D',
                        padding: '2px 4px',
                        margin: 0,
                      },
                    }}
                  />

                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <TextField
                      name="weight"
                      label="Waga"
                      type="number"
                      value={editingRow.weight}
                      onChange={handleEditChange}
                      fullWidth
                      inputProps={{ min: 0 }}
                      error={!!editErrors.weight}
                      helperText={editErrors.weight}
                      sx={{
                        backgroundColor: '#0f172a',
                        input: { color: '#ffffff' },
                        label: { color: '#ffffff' },
                        '& .MuiFormHelperText-root': {
                          color: '#f87171',
                          backgroundColor: '#1D293D',
                          padding: '2px 4px',
                          margin: 0,
                        },
                      }}
                    />
                    <TextField
                      name="price"
                      label="Cena"
                      type="number"
                      value={editingRow.price}
                      onChange={handleEditChange}
                      fullWidth
                      inputProps={{ min: 0 }}
                      error={!!editErrors.price}
                      helperText={editErrors.price}
                      sx={{
                        backgroundColor: '#0f172a',
                        input: { color: '#ffffff' },
                        label: { color: '#ffffff' },
                        '& .MuiFormHelperText-root': {
                          color: '#f87171',
                          backgroundColor: '#1D293D',
                          padding: '2px 4px',
                          margin: 0,
                        },
                      }}
                    />
                  </Box>

                  <FormControl
                    fullWidth
                    error={!!editErrors.category}
                    sx={{
                      backgroundColor: '#1e293b',
                      borderRadius: 2,
                    }}
                  >
                    <InputLabel id="edit-category-label" sx={{ color: '#cbd5e1' }}>
                      Kategoria
                    </InputLabel>
                    <Select
                      labelId="edit-category-label"
                      name="category"
                      label="Kategoria"
                      value={editingRow.category}
                      onChange={handleEditChange}
                      sx={{
                        color: '#e2e8f0',
                        backgroundColor: '#0F172A',
                        '& .MuiSelect-icon': {
                          color: '#94a3b8',
                          backgroundColor: '#1e293b',
                        },
                      }}
                      MenuProps={{
                        PaperProps: {
                          sx: {
                            backgroundColor: '#1e293b',
                            color: '#f1f5f9',
                          },
                        },
                      }}
                    >
                      <MenuItem
                        value=""
                        sx={{
                          backgroundColor: '#1e293b',
                          padding: '8px 12px',
                          fontStyle: 'italic',
                          color: '#94a3b8',
                        }}
                      >
                        <em>Wybierz kategorię</em>
                      </MenuItem>
                      {CATEGORIES.map((c) => (
                        <MenuItem
                          key={c}
                          value={c}
                          sx={{
                            backgroundColor: '#1e293b',
                            padding: '8px 12px',
                            color: '#f1f5f9',
                            '&:hover': {
                              backgroundColor: '#334155',
                            },
                          }}
                        >
                          {c}
                        </MenuItem>
                      ))}
                    </Select>
                    {!!editErrors.category && (
                      <Typography
                        color="error"
                        variant="caption"
                        sx={{
                          backgroundColor: '#1e293b',
                          padding: '4px 8px',
                          borderRadius: 1,
                          marginTop: '4px',
                        }}
                      >
                        {editErrors.category}
                      </Typography>
                    )}
                  </FormControl>

                  <TextField
                    name="priority"
                    label="Priorytet"
                    type="number"
                    value={editingRow.priority}
                    onChange={handleToggleEditPriority}
                    fullWidth
                    error={!!editErrors.priority}
                    sx={{
                      backgroundColor: '#0f172a',
                      input: { color: '#ffffff' },
                      label: { color: '#ffffff' },
                      '& .MuiFormHelperText-root': {
                        color: '#f87171',
                        backgroundColor: '#1D293D',
                        padding: '2px 4px',
                        margin: 0,
                      },
                    }}
                  />

                  <Typography variant="body2" sx={{ color: '#94a3b8', ml: 1, mt: -1 }}>
                    Najwyższy priorytet jest wyświetlany jako pierwszy w menu
                  </Typography>

                  <FormControlLabel
                    control={<Switch checked={editingRow.isActive} onChange={handleToggleEditActive} />}
                    label={editingRow.isActive ? 'Aktywna' : 'Nieaktywna'}
                    sx={{ color: '#cbd5e1' }}
                  />

                  <Button
                    variant="contained"
                    onClick={handleConfirmEdit}
                    sx={{ backgroundColor: '#3b82f6' }}
                  >
                    Zatwierdź
                  </Button>
                </Stack>
              )}
            </Box>
          </Modal>
        </Box>
      </main>
    </div>
  );
};

export default DishesEdit;