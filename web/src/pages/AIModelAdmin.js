import React, { useState, useEffect } from 'react';
import {
    Container,
    Typography,
    Box,
    Paper,
    Button,
    Grid,
    Card,
    CardContent,
    Chip,
    Alert,
    Snackbar,
    CircularProgress,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow
} from '@mui/material';
import {
    SmartToy as AIIcon,
    Speed as SpeedIcon,
    AttachMoney as CostIcon,
    Star as QualityIcon,
    Language as LanguageIcon,
    CheckCircle as ActiveIcon
} from '@mui/icons-material';
import api from '../services/api';

const AIModelAdmin = () => {
    const [models, setModels] = useState({});
    const [currentModel, setCurrentModel] = useState('');
    const [loading, setLoading] = useState(true);
    const [changeLoading, setChangeLoading] = useState(false);
    const [alert, setAlert] = useState({ open: false, message: '', severity: 'success' });
    const [confirmDialog, setConfirmDialog] = useState({ open: false, model: null });

    useEffect(() => {
        fetchModels();
    }, []);

    const fetchModels = async () => {
        try {
            setLoading(true);
            const response = await api.get('/ai/models');
            
            if (response.data.success) {
                setModels(response.data.available_models);
                setCurrentModel(response.data.current_model);
            }
        } catch (error) {
            console.error('Models fetch error:', error);
            showAlert('Model bilgileri alınamadı', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleModelChange = async (modelKey) => {
        try {
            setChangeLoading(true);
            const response = await api.post('/ai/change-model', { model: modelKey });
            
            if (response.data.success) {
                setCurrentModel(modelKey);
                showAlert(response.data.message, 'success');
                setConfirmDialog({ open: false, model: null });
            }
        } catch (error) {
            console.error('Model change error:', error);
            showAlert(error.response?.data?.message || 'Model değiştirilemedi', 'error');
        } finally {
            setChangeLoading(false);
        }
    };

    const showAlert = (message, severity) => {
        setAlert({ open: true, message, severity });
    };

    const getQualityColor = (quality) => {
        switch (quality) {
            case 'Highest': return '#4caf50';
            case 'Very High': return '#66bb6a';
            case 'High': return '#81c784';
            case 'Good': return '#ffb74d';
            case 'Medium': return '#ff9800';
            case 'Fair': return '#f57c00';
            default: return '#9e9e9e';
        }
    };

    const getCostColor = (cost) => {
        switch (cost) {
            case 'Free': return '#4caf50';
            case 'Very Low': return '#66bb6a';
            case 'Low': return '#81c784';
            case 'Medium': return '#ffb74d';
            case 'High': return '#ff9800';
            default: return '#f44336';
        }
    };

    const getTurkishSupportColor = (support) => {
        switch (support) {
            case 'Excellent': return '#4caf50';
            case 'Good': return '#81c784';
            case 'Fair': return '#ffb74d';
            default: return '#f57c00';
        }
    };

    if (loading) {
        return (
            <Container maxWidth="lg" sx={{ py: 4, display: 'flex', justifyContent: 'center' }}>
                <CircularProgress size={40} />
            </Container>
        );
    }

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            {/* Header */}
            <Box sx={{ textAlign: 'center', mb: 4 }}>
                <AIIcon sx={{ fontSize: 48, color: '#ff6b35', mb: 2 }} />
                <Typography variant="h4" gutterBottom>
                    AI Model Yöneticisi
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    TakDrive AI asistanı için model yapılandırması
                </Typography>
            </Box>

            {/* Current Model Info */}
            <Paper sx={{ p: 3, mb: 4, bgcolor: '#2a2a2a' }}>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                    <ActiveIcon sx={{ mr: 1, color: '#4caf50' }} />
                    Aktif Model
                </Typography>
                {models[currentModel] && (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
                        <Chip 
                            label={models[currentModel].name} 
                            color="primary" 
                            variant="filled"
                            sx={{ fontSize: '1rem', py: 1 }}
                        />
                        <Chip 
                            label={models[currentModel].provider} 
                            variant="outlined"
                        />
                        <Chip 
                            label={`Kalite: ${models[currentModel].quality}`}
                            sx={{ 
                                bgcolor: getQualityColor(models[currentModel].quality),
                                color: 'white'
                            }}
                        />
                        <Chip 
                            label={`Maliyet: ${models[currentModel].cost}`}
                            sx={{ 
                                bgcolor: getCostColor(models[currentModel].cost),
                                color: 'white'
                            }}
                        />
                        <Chip 
                            label={`Türkçe: ${models[currentModel].turkish_support}`}
                            sx={{ 
                                bgcolor: getTurkishSupportColor(models[currentModel].turkish_support),
                                color: 'white'
                            }}
                        />
                    </Box>
                )}
            </Paper>

            {/* Models Grid */}
            <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
                Mevcut Modeller
            </Typography>

            <Grid container spacing={3}>
                {Object.entries(models).map(([modelKey, modelInfo]) => (
                    <Grid item xs={12} md={6} lg={4} key={modelKey}>
                        <Card 
                            sx={{ 
                                height: '100%',
                                border: currentModel === modelKey ? '2px solid #ff6b35' : 'none',
                                bgcolor: currentModel === modelKey ? 'rgba(255, 107, 53, 0.1)' : '#2a2a2a',
                                transition: 'all 0.3s ease',
                                '&:hover': {
                                    transform: 'translateY(-4px)',
                                    boxShadow: '0 8px 30px rgba(0, 0, 0, 0.3)'
                                }
                            }}
                        >
                            <CardContent>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                                    <Typography variant="h6" component="h3">
                                        {modelInfo.name}
                                    </Typography>
                                    {currentModel === modelKey && (
                                        <Chip 
                                            label="Aktif" 
                                            size="small" 
                                            color="primary"
                                            icon={<ActiveIcon />}
                                        />
                                    )}
                                </Box>

                                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                    Sağlayıcı: {modelInfo.provider}
                                </Typography>

                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 3 }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span>Kalite:</span>
                                        <Chip 
                                            label={modelInfo.quality}
                                            size="small"
                                            sx={{ 
                                                bgcolor: getQualityColor(modelInfo.quality),
                                                color: 'white',
                                                fontSize: '0.75rem'
                                            }}
                                        />
                                    </Box>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span>Hız:</span>
                                        <Typography variant="body2">{modelInfo.speed}</Typography>
                                    </Box>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span>Maliyet:</span>
                                        <Chip 
                                            label={modelInfo.cost}
                                            size="small"
                                            sx={{ 
                                                bgcolor: getCostColor(modelInfo.cost),
                                                color: 'white',
                                                fontSize: '0.75rem'
                                            }}
                                        />
                                    </Box>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span>Türkçe Desteği:</span>
                                        <Chip 
                                            label={modelInfo.turkish_support}
                                            size="small"
                                            sx={{ 
                                                bgcolor: getTurkishSupportColor(modelInfo.turkish_support),
                                                color: 'white',
                                                fontSize: '0.75rem'
                                            }}
                                        />
                                    </Box>
                                </Box>

                                <Button
                                    fullWidth
                                    variant={currentModel === modelKey ? "outlined" : "contained"}
                                    disabled={currentModel === modelKey || changeLoading}
                                    onClick={() => setConfirmDialog({ open: true, model: modelKey })}
                                    sx={{
                                        bgcolor: currentModel === modelKey ? 'transparent' : '#ff6b35',
                                        '&:hover': {
                                            bgcolor: currentModel === modelKey ? 'rgba(255, 107, 53, 0.1)' : '#e55a2b'
                                        }
                                    }}
                                >
                                    {currentModel === modelKey ? 'Aktif Model' : 'Bu Modeli Seç'}
                                </Button>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            {/* Model Comparison Table */}
            <Box sx={{ mt: 4 }}>
                <Typography variant="h5" gutterBottom>
                    Model Karşılaştırması
                </Typography>
                <TableContainer component={Paper} sx={{ bgcolor: '#2a2a2a' }}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Model</TableCell>
                                <TableCell>Sağlayıcı</TableCell>
                                <TableCell>Kalite</TableCell>
                                <TableCell>Hız</TableCell>
                                <TableCell>Maliyet</TableCell>
                                <TableCell>Türkçe Desteği</TableCell>
                                <TableCell>Durum</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {Object.entries(models).map(([modelKey, modelInfo]) => (
                                <TableRow key={modelKey}>
                                    <TableCell>{modelInfo.name}</TableCell>
                                    <TableCell>{modelInfo.provider}</TableCell>
                                    <TableCell>
                                        <Chip 
                                            label={modelInfo.quality}
                                            size="small"
                                            sx={{ 
                                                bgcolor: getQualityColor(modelInfo.quality),
                                                color: 'white'
                                            }}
                                        />
                                    </TableCell>
                                    <TableCell>{modelInfo.speed}</TableCell>
                                    <TableCell>
                                        <Chip 
                                            label={modelInfo.cost}
                                            size="small"
                                            sx={{ 
                                                bgcolor: getCostColor(modelInfo.cost),
                                                color: 'white'
                                            }}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Chip 
                                            label={modelInfo.turkish_support}
                                            size="small"
                                            sx={{ 
                                                bgcolor: getTurkishSupportColor(modelInfo.turkish_support),
                                                color: 'white'
                                            }}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        {currentModel === modelKey ? (
                                            <Chip 
                                                label="Aktif" 
                                                color="primary"
                                                icon={<ActiveIcon />}
                                            />
                                        ) : (
                                            <Button
                                                size="small"
                                                variant="outlined"
                                                onClick={() => setConfirmDialog({ open: true, model: modelKey })}
                                                disabled={changeLoading}
                                            >
                                                Seç
                                            </Button>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Box>

            {/* Confirmation Dialog */}
            <Dialog 
                open={confirmDialog.open} 
                onClose={() => setConfirmDialog({ open: false, model: null })}
            >
                <DialogTitle>Model Değişikliği Onayı</DialogTitle>
                <DialogContent>
                    <Typography>
                        AI modelini <strong>{models[confirmDialog.model]?.name}</strong> olarak değiştirmek istediğinizden emin misiniz?
                    </Typography>
                    <Box sx={{ mt: 2 }}>
                        <Typography variant="body2" color="text.secondary">
                            Bu değişiklik tüm yeni AI sohbetlerini etkileyecektir.
                        </Typography>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setConfirmDialog({ open: false, model: null })}>
                        İptal
                    </Button>
                    <Button 
                        onClick={() => handleModelChange(confirmDialog.model)} 
                        variant="contained"
                        disabled={changeLoading}
                    >
                        {changeLoading ? <CircularProgress size={20} /> : 'Değiştir'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Success/Error Snackbar */}
            <Snackbar
                open={alert.open}
                autoHideDuration={6000}
                onClose={() => setAlert({ ...alert, open: false })}
            >
                <Alert 
                    onClose={() => setAlert({ ...alert, open: false })} 
                    severity={alert.severity}
                    sx={{ width: '100%' }}
                >
                    {alert.message}
                </Alert>
            </Snackbar>
        </Container>
    );
};

export default AIModelAdmin; 