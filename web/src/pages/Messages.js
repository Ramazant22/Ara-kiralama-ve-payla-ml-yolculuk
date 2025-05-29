import React, { useState, useEffect } from 'react';
import {
    Container,
    Typography,
    Box,
    List,
    ListItem,
    ListItemAvatar,
    ListItemText,
    Avatar,
    Badge,
    Chip,
    Divider,
    TextField,
    InputAdornment,
    Paper,
    Tab,
    Tabs,
    CircularProgress,
    Alert
} from '@mui/material';
import {
    Search as SearchIcon,
    Message as MessageIcon,
    DirectionsCar as CarIcon,
    Group as GroupIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

function TabPanel({ children, value, index, ...other }) {
    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`messages-tabpanel-${index}`}
            aria-labelledby={`messages-tab-${index}`}
            {...other}
        >
            {value === index && <Box sx={{ py: 2 }}>{children}</Box>}
        </div>
    );
}

const Messages = () => {
    const navigate = useNavigate();
    const [conversations, setConversations] = useState([]);
    const [filteredConversations, setFilteredConversations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [tabValue, setTabValue] = useState(0);

    // Konuşmaları getir
    const fetchConversations = async (type = null) => {
        try {
            setLoading(true);
            const response = await api.get('/conversations', {
                params: type ? { type } : {}
            });
            setConversations(response.data.conversations);
            setFilteredConversations(response.data.conversations);
        } catch (err) {
            setError('Konuşmalar yüklenirken hata oluştu');
            console.error('Fetch conversations error:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchConversations();
    }, []);

    // Tab değiştiğinde filtrele
    useEffect(() => {
        let filtered = conversations;
        
        switch (tabValue) {
            case 1: // Araç Kiralama
                filtered = conversations.filter(conv => conv.type === 'vehicle_rental');
                break;
            case 2: // Yolculuk Paylaşımı
                filtered = conversations.filter(conv => conv.type === 'ride_sharing');
                break;
            case 3: // Genel
                filtered = conversations.filter(conv => conv.type === 'general');
                break;
            default: // Tümü
                filtered = conversations;
        }

        // Arama filtresi
        if (searchTerm) {
            filtered = filtered.filter(conv => 
                conv.otherParticipant?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                conv.otherParticipant?.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                conv.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                conv.lastMessage?.content?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        setFilteredConversations(filtered);
    }, [tabValue, searchTerm, conversations]);

    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
    };

    const handleConversationClick = (conversationId) => {
        navigate(`/messages/${conversationId}`);
    };

    const formatLastMessageTime = (dateString) => {
        if (!dateString) return '';
        
        const date = new Date(dateString);
        const now = new Date();
        const diffInHours = (now - date) / (1000 * 60 * 60);
        
        if (diffInHours < 1) {
            const diffInMinutes = Math.floor((now - date) / (1000 * 60));
            return `${diffInMinutes}dk önce`;
        } else if (diffInHours < 24) {
            return `${Math.floor(diffInHours)}sa önce`;
        } else {
            return date.toLocaleDateString('tr-TR', {
                day: 'numeric',
                month: 'short'
            });
        }
    };

    const getTypeIcon = (type) => {
        switch (type) {
            case 'vehicle_rental':
                return <CarIcon color="primary" />;
            case 'ride_sharing':
                return <GroupIcon color="secondary" />;
            default:
                return <MessageIcon />;
        }
    };

    const getTypeLabel = (type) => {
        switch (type) {
            case 'vehicle_rental':
                return 'Araç Kiralama';
            case 'ride_sharing':
                return 'Yolculuk';
            case 'general':
                return 'Genel';
            default:
                return '';
        }
    };

    const renderConversationItem = (conversation) => (
        <ListItem
            key={conversation._id}
            button
            onClick={() => handleConversationClick(conversation._id)}
            sx={{
                borderRadius: 2,
                mb: 1,
                border: '1px solid',
                borderColor: 'divider',
                '&:hover': {
                    backgroundColor: 'action.hover'
                }
            }}
        >
            <ListItemAvatar>
                <Badge
                    badgeContent={conversation.unreadCount || 0}
                    color="error"
                    invisible={!conversation.unreadCount}
                >
                    <Avatar
                        src={conversation.otherParticipant?.avatar}
                        sx={{
                            border: conversation.otherParticipant?.isOnline ? '2px solid #4caf50' : 'none'
                        }}
                    >
                        {conversation.otherParticipant?.firstName?.[0]?.toUpperCase()}
                    </Avatar>
                </Badge>
            </ListItemAvatar>
            
            <ListItemText
                primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="subtitle1" fontWeight={conversation.unreadCount ? 'bold' : 'normal'}>
                            {conversation.otherParticipant?.firstName} {conversation.otherParticipant?.lastName}
                        </Typography>
                        <Chip
                            icon={getTypeIcon(conversation.type)}
                            label={getTypeLabel(conversation.type)}
                            size="small"
                            variant="outlined"
                        />
                    </Box>
                }
                secondary={
                    <Box>
                        <Typography 
                            variant="body2" 
                            color="text.secondary"
                            fontWeight={conversation.unreadCount ? 'bold' : 'normal'}
                            sx={{ 
                                display: '-webkit-box',
                                WebkitLineClamp: 1,
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden'
                            }}
                        >
                            {conversation.lastMessage?.content || 'Henüz mesaj yok'}
                        </Typography>
                        <Typography variant="caption" color="text.disabled">
                            {formatLastMessageTime(conversation.lastMessage?.sentAt)}
                        </Typography>
                    </Box>
                }
            />
        </ListItem>
    );

    if (loading) {
        return (
            <Container maxWidth="md" sx={{ py: 4, textAlign: 'center' }}>
                <CircularProgress />
                <Typography variant="body1" sx={{ mt: 2 }}>
                    Konuşmalar yükleniyor...
                </Typography>
            </Container>
        );
    }

    return (
        <Container maxWidth="md" sx={{ py: 4 }}>
            <Box sx={{ mb: 3 }}>
                <Typography variant="h4" gutterBottom>
                    Mesajlarım
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    Araç kiralama ve yolculuk paylaşımı konuşmalarınız
                </Typography>
            </Box>

            {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                    {error}
                </Alert>
            )}

            {/* Arama */}
            <TextField
                fullWidth
                placeholder="Konuşmalarda ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                    startAdornment: (
                        <InputAdornment position="start">
                            <SearchIcon />
                        </InputAdornment>
                    )
                }}
                sx={{ mb: 3 }}
            />

            {/* Tabs */}
            <Paper sx={{ mb: 3 }}>
                <Tabs
                    value={tabValue}
                    onChange={handleTabChange}
                    indicatorColor="primary"
                    textColor="primary"
                    variant="fullWidth"
                >
                    <Tab label="Tümü" />
                    <Tab label="Araç Kiralama" />
                    <Tab label="Yolculuk Paylaşımı" />
                    <Tab label="Genel" />
                </Tabs>
            </Paper>

            {/* Konuşma Listesi */}
            <TabPanel value={tabValue} index={tabValue}>
                {filteredConversations.length === 0 ? (
                    <Paper sx={{ p: 4, textAlign: 'center' }}>
                        <MessageIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                        <Typography variant="h6" color="text.secondary" gutterBottom>
                            {searchTerm ? 'Arama sonucu bulunamadı' : 'Henüz konuşmanız yok'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            {searchTerm 
                                ? 'Farklı anahtar kelimeler deneyebilirsiniz'
                                : 'Araç kiralama veya yolculuk paylaşımı için iletişime geçtiğinizde konuşmalarınız burada görünecek'
                            }
                        </Typography>
                    </Paper>
                ) : (
                    <List sx={{ p: 0 }}>
                        {filteredConversations.map(renderConversationItem)}
                    </List>
                )}
            </TabPanel>
        </Container>
    );
};

export default Messages; 