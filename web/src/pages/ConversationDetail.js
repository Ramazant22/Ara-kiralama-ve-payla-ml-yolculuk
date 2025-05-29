import React, { useState, useEffect, useRef } from 'react';
import {
    Container,
    Typography,
    Box,
    Paper,
    TextField,
    IconButton,
    Avatar,
    Chip,
    Divider,
    CircularProgress,
    Alert,
    AppBar,
    Toolbar,
    Card,
    CardContent
} from '@mui/material';
import {
    Send as SendIcon,
    ArrowBack as ArrowBackIcon,
    DirectionsCar as CarIcon,
    Group as GroupIcon,
    Message as MessageIcon,
    Edit as EditIcon,
    Reply as ReplyIcon
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

const ConversationDetail = () => {
    const { conversationId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const messagesEndRef = useRef(null);
    
    const [conversation, setConversation] = useState(null);
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [newMessage, setNewMessage] = useState('');
    const [sending, setSending] = useState(false);
    const [replyTo, setReplyTo] = useState(null);

    // Konuşma ve mesajları getir
    const fetchConversationAndMessages = async () => {
        try {
            setLoading(true);
            
            // Konuşma detayını getir
            const convResponse = await api.get(`/conversations/${conversationId}`);
            setConversation(convResponse.data.conversation);
            
            // Mesajları getir
            const messagesResponse = await api.get(`/messages/conversation/${conversationId}`);
            setMessages(messagesResponse.data.messages);
            
        } catch (err) {
            setError('Konuşma yüklenirken hata oluştu');
            console.error('Fetch conversation error:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (conversationId) {
            fetchConversationAndMessages();
        }
    }, [conversationId]);

    // Mesajlar güncellendiğinde en alta scroll
    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    // Mesaj gönder
    const handleSendMessage = async (e) => {
        e.preventDefault();
        
        if (!newMessage.trim()) return;
        
        try {
            setSending(true);
            
            const messageData = {
                conversationId,
                content: newMessage.trim(),
                messageType: 'text',
                ...(replyTo && { replyTo: replyTo._id })
            };
            
            const response = await api.post('/messages', messageData);
            
            // Yeni mesajı listeye ekle
            setMessages(prev => [...prev, response.data.data]);
            setNewMessage('');
            setReplyTo(null);
            
        } catch (err) {
            setError('Mesaj gönderilirken hata oluştu');
            console.error('Send message error:', err);
        } finally {
            setSending(false);
        }
    };

    const formatMessageTime = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInHours = (now - date) / (1000 * 60 * 60);
        
        if (diffInHours < 24) {
            return date.toLocaleTimeString('tr-TR', {
                hour: '2-digit',
                minute: '2-digit'
            });
        } else {
            return date.toLocaleDateString('tr-TR', {
                day: 'numeric',
                month: 'short',
                hour: '2-digit',
                minute: '2-digit'
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

    const renderMessage = (message, index) => {
        const isOwnMessage = message.sender._id === user._id;
        const isSystemMessage = message.messageType === 'system';
        
        if (isSystemMessage) {
            return (
                <Box key={message._id} sx={{ textAlign: 'center', my: 2 }}>
                    <Chip
                        label={message.content}
                        size="small"
                        sx={{ backgroundColor: 'action.hover' }}
                    />
                </Box>
            );
        }

        return (
            <Box
                key={message._id}
                sx={{
                    display: 'flex',
                    flexDirection: isOwnMessage ? 'row-reverse' : 'row',
                    mb: 2,
                    alignItems: 'flex-start',
                    gap: 1
                }}
            >
                {!isOwnMessage && (
                    <Avatar
                        src={message.sender.avatar}
                        sx={{ width: 32, height: 32 }}
                    >
                        {message.sender.firstName?.[0]?.toUpperCase()}
                    </Avatar>
                )}
                
                <Box sx={{ maxWidth: '70%' }}>
                    {/* Yanıtlanan mesaj */}
                    {message.replyTo && (
                        <Card 
                            sx={{ 
                                mb: 1, 
                                backgroundColor: 'action.hover',
                                borderLeft: 3,
                                borderColor: 'primary.main'
                            }}
                        >
                            <CardContent sx={{ p: 1, '&:last-child': { pb: 1 } }}>
                                <Typography variant="caption" color="text.secondary">
                                    Yanıtlanan mesaj:
                                </Typography>
                                <Typography variant="body2">
                                    {message.replyTo.content}
                                </Typography>
                            </CardContent>
                        </Card>
                    )}
                    
                    {/* Ana mesaj */}
                    <Paper
                        sx={{
                            p: 2,
                            backgroundColor: isOwnMessage ? 'primary.main' : 'background.paper',
                            color: isOwnMessage ? 'primary.contrastText' : 'text.primary',
                            borderRadius: 3,
                            borderTopRightRadius: isOwnMessage ? 1 : 3,
                            borderTopLeftRadius: isOwnMessage ? 3 : 1,
                            position: 'relative',
                            '&:hover .message-actions': {
                                opacity: 1
                            }
                        }}
                    >
                        <Typography variant="body1">
                            {message.content}
                        </Typography>
                        
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                            <Typography 
                                variant="caption" 
                                sx={{ 
                                    color: isOwnMessage ? 'primary.contrastText' : 'text.secondary',
                                    opacity: 0.8
                                }}
                            >
                                {formatMessageTime(message.createdAt)}
                                {message.isEdited && ' (düzenlendi)'}
                            </Typography>
                            
                            {/* Mesaj aksiyonları */}
                            <Box 
                                className="message-actions"
                                sx={{ 
                                    opacity: 0, 
                                    transition: 'opacity 0.2s',
                                    display: 'flex',
                                    gap: 0.5
                                }}
                            >
                                <IconButton
                                    size="small"
                                    onClick={() => setReplyTo(message)}
                                    sx={{ 
                                        color: isOwnMessage ? 'primary.contrastText' : 'text.secondary',
                                        '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' }
                                    }}
                                >
                                    <ReplyIcon fontSize="small" />
                                </IconButton>
                            </Box>
                        </Box>
                    </Paper>
                </Box>
            </Box>
        );
    };

    if (loading) {
        return (
            <Container maxWidth="md" sx={{ py: 4, textAlign: 'center' }}>
                <CircularProgress />
                <Typography variant="body1" sx={{ mt: 2 }}>
                    Konuşma yükleniyor...
                </Typography>
            </Container>
        );
    }

    if (!conversation) {
        return (
            <Container maxWidth="md" sx={{ py: 4 }}>
                <Alert severity="error">
                    Konuşma bulunamadı
                </Alert>
            </Container>
        );
    }

    return (
        <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
            {/* Header */}
            <AppBar position="static" color="default" elevation={1}>
                <Toolbar>
                    <IconButton
                        edge="start"
                        onClick={() => navigate('/messages')}
                        sx={{ mr: 2 }}
                    >
                        <ArrowBackIcon />
                    </IconButton>
                    
                    <Avatar
                        src={conversation.otherParticipant?.avatar}
                        sx={{ width: 40, height: 40, mr: 2 }}
                    >
                        {conversation.otherParticipant?.firstName?.[0]?.toUpperCase()}
                    </Avatar>
                    
                    <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="h6">
                            {conversation.otherParticipant?.firstName} {conversation.otherParticipant?.lastName}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Chip
                                icon={getTypeIcon(conversation.type)}
                                label={getTypeLabel(conversation.type)}
                                size="small"
                                variant="outlined"
                            />
                            {conversation.otherParticipant?.isOnline && (
                                <Typography variant="caption" color="success.main">
                                    Çevrimiçi
                                </Typography>
                            )}
                        </Box>
                    </Box>
                </Toolbar>
            </AppBar>

            {error && (
                <Alert severity="error" sx={{ m: 2 }}>
                    {error}
                </Alert>
            )}

            {/* Mesajlar */}
            <Box 
                sx={{ 
                    flexGrow: 1, 
                    overflow: 'auto', 
                    p: 2,
                    backgroundColor: 'grey.50'
                }}
            >
                {messages.length === 0 ? (
                    <Box sx={{ textAlign: 'center', py: 4 }}>
                        <MessageIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                        <Typography variant="h6" color="text.secondary">
                            Henüz mesaj yok
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            İlk mesajı göndererek konuşmayı başlatın
                        </Typography>
                    </Box>
                ) : (
                    <>
                        {messages.map(renderMessage)}
                        <div ref={messagesEndRef} />
                    </>
                )}
            </Box>

            {/* Yanıtlama bildirimi */}
            {replyTo && (
                <Paper sx={{ p: 2, m: 2, mt: 0, backgroundColor: 'action.hover' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Box>
                            <Typography variant="caption" color="text.secondary">
                                Yanıtlanıyor:
                            </Typography>
                            <Typography variant="body2">
                                {replyTo.content}
                            </Typography>
                        </Box>
                        <IconButton size="small" onClick={() => setReplyTo(null)}>
                            ✕
                        </IconButton>
                    </Box>
                </Paper>
            )}

            {/* Mesaj gönderme */}
            <Paper 
                component="form" 
                onSubmit={handleSendMessage}
                sx={{ p: 2, m: 2, mt: 0, display: 'flex', gap: 1 }}
            >
                <TextField
                    fullWidth
                    placeholder="Mesajınızı yazın..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    multiline
                    maxRows={4}
                    disabled={sending}
                />
                <IconButton
                    type="submit"
                    color="primary"
                    disabled={!newMessage.trim() || sending}
                    sx={{ alignSelf: 'flex-end' }}
                >
                    {sending ? <CircularProgress size={24} /> : <SendIcon />}
                </IconButton>
            </Paper>
        </Box>
    );
};

export default ConversationDetail; 