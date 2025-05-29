import React, { useState, useEffect, useRef } from 'react';
import {
    Container,
    Typography,
    Box,
    Paper,
    TextField,
    IconButton,
    Card,
    CardContent,
    Chip,
    Grid,
    Button,
    Divider,
    Avatar,
    CircularProgress,
    Alert,
    Fade,
    Zoom
} from '@mui/material';
import {
    Send as SendIcon,
    SmartToy as BotIcon,
    Person as PersonIcon,
    DirectionsCar as CarIcon,
    Group as GroupIcon,
    Help as HelpIcon,
    TrendingUp as TrendingIcon,
    Security as SecurityIcon,
    MonetizationOn as PriceIcon,
    Launch as LaunchIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const AIChat = () => {
    const navigate = useNavigate();
    const messagesEndRef = useRef(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [popularTopics, setPopularTopics] = useState([]);

    // İlk yükleme mesajı
    useEffect(() => {
        setMessages([
            {
                id: Date.now(),
                content: '👋 Merhaba! Ben TakDrive AI asistanıyım!\n\n🇹🇷 Size Türkçe olarak yardımcı olabilirim.\n\n🎯 Nasıl yardımcı olabilirim?\n\n🚗 Araç kiralama hakkında sorular\n🚌 Yolculuk paylaşımı bilgileri\n⚙️ Platform özelliklerini öğrenme\n💡 Uygun araç ve yolculuk önerileri\n🔒 Güvenlik tavsiyeleri\n\n✨ Sol taraftaki hızlı butonları kullanabilir veya doğrudan Türkçe soru sorabilirsiniz!\n\nHadi başlayalım! 😊',
                sender: 'ai',
                timestamp: new Date(),
                suggestions: []
            }
        ]);

        fetchPopularTopics();
    }, []);

    // Mesajlar güncellendiğinde scroll
    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const fetchPopularTopics = async () => {
        try {
            const response = await api.get('/ai/popular-topics');
            setPopularTopics(response.data.topics);
        } catch (error) {
            console.error('Popular topics fetch error:', error);
        }
    };

    const handleSendMessage = async (messageText = null) => {
        const text = messageText || newMessage.trim();
        if (!text) return;

        const userMessage = {
            id: Date.now(),
            content: text,
            sender: 'user',
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage]);
        setNewMessage('');
        setLoading(true);
        setError('');

        try {
            console.log('Sending message to AI:', text);
            
            const response = await api.post('/ai/chat', {
                message: text,
                context: {}
            });

            console.log('AI response received:', response.data);

            if (response.data.success) {
                const aiMessage = {
                    id: Date.now() + 1,
                    content: response.data.message,
                    sender: 'ai',
                    timestamp: new Date(),
                    suggestions: response.data.suggestions || []
                };

                setMessages(prev => [...prev, aiMessage]);
            } else {
                throw new Error(response.data.error || 'AI yanıt vermedi');
            }

        } catch (err) {
            console.error('AI chat error:', err);
            
            let errorMessage = '😔 AI asistanına şu anda ulaşılamıyor.\n\n';
            
            if (err.response?.status === 401) {
                errorMessage += '🔐 Giriş yapmanız gerekiyor.\n\n➡️ Lütfen önce giriş yapın.';
            } else if (err.response?.status === 500) {
                errorMessage += '⚠️ Sunucu geçici olarak hizmet veremiyor.\n\n🔄 Birkaç dakika sonra tekrar deneyin.';
            } else if (err.code === 'NETWORK_ERROR' || err.message.includes('Network Error')) {
                errorMessage += '🌐 İnternet bağlantısı sorunu.\n\n📶 Bağlantınızı kontrol edip tekrar deneyin.';
            } else {
                errorMessage += '🛠️ Teknik bir sorun oluştu.\n\n⏰ Lütfen birkaç dakika sonra tekrar deneyin.\n\n💬 Sorun devam ederse destek ekibi ile iletişime geçin.';
            }
            
            setError(errorMessage);
            
            // Hata mesajını chat'e de ekle
            const errorAiMessage = {
                id: Date.now() + 1,
                content: errorMessage,
                sender: 'ai',
                timestamp: new Date(),
                suggestions: []
            };
            setMessages(prev => [...prev, errorAiMessage]);
            
        } finally {
            setLoading(false);
        }
    };

    const handleSuggestionClick = (suggestion) => {
        if (suggestion.type === 'vehicle') {
            navigate(`/vehicles/${suggestion.id}`);
        } else if (suggestion.type === 'ride') {
            navigate(`/rides/${suggestion.id}`);
        }
    };

    const handleQuickAction = (action) => {
        const quickMessages = {
            'vehicle_rental': 'Araç kiralama konusunda yardım istiyorum',
            'ride_sharing': 'Yolculuk paylaşımı hakkında bilgi alabilir miyim?',
            'pricing': 'Fiyatlar hakkında bilgi verebilir misiniz?',
            'security': 'Güvenlik konusunda nelere dikkat etmeliyim?',
            'how_to_use': 'Platform nasıl kullanılır?'
        };

        if (quickMessages[action]) {
            handleSendMessage(quickMessages[action]);
        }
    };

    const handleTopicClick = (topic) => {
        handleSendMessage(topic.description);
    };

    const formatMessageContent = (content) => {
        // VEHICLE_ID ve RIDE_ID referanslarını temizle
        let cleanContent = content
            .replace(/VEHICLE_ID:[a-f0-9]{24}/g, '')
            .replace(/RIDE_ID:[a-f0-9]{24}/g, '')
            .replace(/\*\s*\*\*VEHICLE_ID:\*\*[^*]*\*/g, '')
            .replace(/\*\s*\*\*RIDE_ID:\*\*[^*]*\*/g, '')
            .replace(/- VEHICLE_ID:[a-f0-9]{24}/g, '')
            .replace(/- RIDE_ID:[a-f0-9]{24}/g, '')
            .replace(/\* \*\*VEHICLE_ID:\*\*[^\n]*/g, '')
            .replace(/\* \*\*RIDE_ID:\*\*[^\n]*/g, '')
            .replace(/\*\*VEHICLE_ID:\*\*[^\n]*/g, '')
            .replace(/\*\*RIDE_ID:\*\*[^\n]*/g, '')
            .trim();

        // Çoklu boş satırları tek satıra dönüştür
        cleanContent = cleanContent.replace(/\n\s*\n\s*\n/g, '\n\n');
        
        // Başında ve sonunda gereksiz boşlukları temizle
        cleanContent = cleanContent.replace(/^\s+|\s+$/g, '');

        return cleanContent;
    };

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            {/* Header */}
            <Box sx={{ textAlign: 'center', mb: 4 }}>
                <Avatar
                    sx={{ 
                        width: 80, 
                        height: 80, 
                        bgcolor: '#ff6b35', 
                        mx: 'auto', 
                        mb: 2,
                        fontSize: '2rem'
                    }}
                >
                    🤖
                </Avatar>
                <Typography variant="h4" gutterBottom>
                    TakDrive AI Asistanı
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    Araç kiralama ve yolculuk paylaşımı konusunda size yardımcı olmak için buradayım
                </Typography>
            </Box>

            <Grid container spacing={3}>
                {/* Sol Panel - Hızlı Aksiyonlar */}
                <Grid item xs={12} md={3}>
                    <Card sx={{ position: 'sticky', top: 20 }}>
                        <CardContent>
                            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                                <HelpIcon sx={{ mr: 1, color: '#ff6b35' }} />
                                Hızlı Sorular
                            </Typography>
                            
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                <Button
                                    fullWidth
                                    variant="outlined"
                                    startIcon={<CarIcon />}
                                    onClick={() => handleQuickAction('vehicle_rental')}
                                    sx={{ 
                                        justifyContent: 'flex-start', 
                                        textAlign: 'left',
                                        color: 'white',
                                        borderColor: 'rgba(255, 255, 255, 0.3)',
                                        '&:hover': {
                                            borderColor: '#ff6b35',
                                            bgcolor: 'rgba(255, 107, 53, 0.1)'
                                        }
                                    }}
                                >
                                    Araç Kiralama
                                </Button>
                                <Button
                                    fullWidth
                                    variant="outlined"
                                    startIcon={<GroupIcon />}
                                    onClick={() => handleQuickAction('ride_sharing')}
                                    sx={{ 
                                        justifyContent: 'flex-start', 
                                        textAlign: 'left',
                                        color: 'white',
                                        borderColor: 'rgba(255, 255, 255, 0.3)',
                                        '&:hover': {
                                            borderColor: '#ff6b35',
                                            bgcolor: 'rgba(255, 107, 53, 0.1)'
                                        }
                                    }}
                                >
                                    Yolculuk Paylaşımı
                                </Button>
                                <Button
                                    fullWidth
                                    variant="outlined"
                                    startIcon={<PriceIcon />}
                                    onClick={() => handleQuickAction('pricing')}
                                    sx={{ 
                                        justifyContent: 'flex-start', 
                                        textAlign: 'left',
                                        color: 'white',
                                        borderColor: 'rgba(255, 255, 255, 0.3)',
                                        '&:hover': {
                                            borderColor: '#ff6b35',
                                            bgcolor: 'rgba(255, 107, 53, 0.1)'
                                        }
                                    }}
                                >
                                    Fiyat Bilgisi
                                </Button>
                                <Button
                                    fullWidth
                                    variant="outlined"
                                    startIcon={<SecurityIcon />}
                                    onClick={() => handleQuickAction('security')}
                                    sx={{ 
                                        justifyContent: 'flex-start', 
                                        textAlign: 'left',
                                        color: 'white',
                                        borderColor: 'rgba(255, 255, 255, 0.3)',
                                        '&:hover': {
                                            borderColor: '#ff6b35',
                                            bgcolor: 'rgba(255, 107, 53, 0.1)'
                                        }
                                    }}
                                >
                                    Güvenlik
                                </Button>
                            </Box>

                            <Divider sx={{ my: 2 }} />

                            <Typography variant="subtitle1" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                                <TrendingIcon sx={{ mr: 1, color: '#ff6b35' }} />
                                Popüler Konular
                            </Typography>
                            
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                {popularTopics.map((topic, index) => (
                                    <Chip
                                        key={index}
                                        label={topic.title}
                                        onClick={() => handleTopicClick(topic)}
                                        variant="outlined"
                                        sx={{ 
                                            justifyContent: 'flex-start',
                                            color: 'white',
                                            borderColor: 'rgba(255, 255, 255, 0.3)',
                                            '&:hover': { 
                                                bgcolor: 'rgba(255, 107, 53, 0.1)',
                                                borderColor: '#ff6b35'
                                            }
                                        }}
                                    />
                                ))}
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Merkez Panel - Chat */}
                <Grid item xs={12} md={9}>
                    <Box sx={{ 
                        height: '600px',
                        display: 'flex', 
                        flexDirection: 'column'
                    }}>
                        <Card sx={{ 
                            height: '100%',
                            display: 'flex', 
                            flexDirection: 'column',
                            overflow: 'hidden'
                        }}>
                            {/* Chat Header - Sabit */}
                            <Box sx={{ 
                                p: 2, 
                                bgcolor: '#ff6b35', 
                                color: 'white', 
                                flexShrink: 0,
                                height: '64px',
                                display: 'flex',
                                alignItems: 'center'
                            }}>
                                <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center' }}>
                                    <BotIcon sx={{ mr: 1 }} />
                                    AI Asistanı - Canlı Chat
                                </Typography>
                            </Box>

                            {/* Mesajlar Alanı - Esnek */}
                            <Box sx={{ 
                                flex: 1,
                                overflow: 'auto', 
                                p: 2,
                                bgcolor: '#1a1a1a',
                                minHeight: 0
                            }}>
                                {error && (
                                    <Alert severity="error" sx={{ mb: 2 }}>
                                        {error}
                                    </Alert>
                                )}

                                {messages.map((message) => (
                                    <Fade key={message.id} in={true} timeout={500}>
                                        <Box
                                            sx={{
                                                display: 'flex',
                                                flexDirection: message.sender === 'user' ? 'row-reverse' : 'row',
                                                mb: 2,
                                                alignItems: 'flex-start',
                                                gap: 1
                                            }}
                                        >
                                            <Avatar
                                                sx={{
                                                    bgcolor: message.sender === 'user' ? '#2196f3' : '#ff6b35',
                                                    width: 36,
                                                    height: 36
                                                }}
                                            >
                                                {message.sender === 'user' ? <PersonIcon /> : <BotIcon />}
                                            </Avatar>
                                            
                                            <Box sx={{ maxWidth: '70%' }}>
                                                <Paper
                                                    sx={{
                                                        p: 2,
                                                        backgroundColor: message.sender === 'user' ? '#2a2a2a' : '#3a3a3a',
                                                        color: 'white',
                                                        borderRadius: 2,
                                                        borderTopRightRadius: message.sender === 'user' ? 0 : 2,
                                                        borderTopLeftRadius: message.sender === 'user' ? 2 : 0,
                                                        border: message.sender === 'user' 
                                                            ? '1px solid rgba(33, 150, 243, 0.3)' 
                                                            : '1px solid rgba(255, 107, 53, 0.3)'
                                                    }}
                                                >
                                                    <Typography variant="body1" sx={{ 
                                                        whiteSpace: 'pre-wrap',
                                                        color: 'white',
                                                        lineHeight: 1.6
                                                    }}>
                                                        {formatMessageContent(message.content)}
                                                    </Typography>
                                                    
                                                    <Typography variant="caption" sx={{ 
                                                        mt: 1, 
                                                        display: 'block',
                                                        color: 'rgba(255, 255, 255, 0.6)'
                                                    }}>
                                                        {message.timestamp.toLocaleTimeString('tr-TR')}
                                                    </Typography>
                                                </Paper>

                                                {/* AI Önerileri */}
                                                {message.suggestions && message.suggestions.length > 0 && (
                                                    <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                                        {message.suggestions.map((suggestion, index) => (
                                                            <Zoom key={index} in={true} timeout={300 + index * 100}>
                                                                <Chip
                                                                    icon={suggestion.type === 'vehicle' ? <CarIcon /> : <GroupIcon />}
                                                                    label={
                                                                        suggestion.title && suggestion.price 
                                                                            ? `${suggestion.title} - ${suggestion.price}`
                                                                            : suggestion.type === 'vehicle' 
                                                                                ? '🚗 Araç Detayını İncele' 
                                                                                : '🚌 Yolculuk Detayını İncele'
                                                                    }
                                                                    onClick={() => handleSuggestionClick(suggestion)}
                                                                    color="primary"
                                                                    variant="filled"
                                                                    clickable
                                                                    sx={{ 
                                                                        bgcolor: '#ff6b35',
                                                                        color: 'white',
                                                                        fontWeight: 'bold',
                                                                        fontSize: '0.85rem',
                                                                        '&:hover': { 
                                                                            bgcolor: '#e55a2b',
                                                                            transform: 'translateY(-2px)',
                                                                            boxShadow: '0 4px 12px rgba(255, 107, 53, 0.4)'
                                                                        },
                                                                        transition: 'all 0.3s ease'
                                                                    }}
                                                                />
                                                            </Zoom>
                                                        ))}
                                                    </Box>
                                                )}
                                            </Box>
                                        </Box>
                                    </Fade>
                                ))}

                                {loading && (
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                                        <Avatar sx={{ bgcolor: '#ff6b35', width: 36, height: 36 }}>
                                            <BotIcon />
                                        </Avatar>
                                        <Paper sx={{ 
                                            p: 2, 
                                            display: 'flex', 
                                            alignItems: 'center', 
                                            gap: 1,
                                            bgcolor: '#3a3a3a',
                                            color: 'white'
                                        }}>
                                            <CircularProgress size={16} sx={{ color: '#ff6b35' }} />
                                            <Typography variant="body2" sx={{ color: 'white' }}>Düşünüyorum...</Typography>
                                        </Paper>
                                    </Box>
                                )}

                                <div ref={messagesEndRef} />
                            </Box>

                            {/* Mesaj Gönderme Alanı - Sabit */}
                            <Box sx={{ 
                                p: 2, 
                                borderTop: 1, 
                                borderColor: 'rgba(255,255,255,0.1)', 
                                bgcolor: '#2a2a2a',
                                flexShrink: 0,
                                height: 'auto',
                                minHeight: '80px'
                            }}>
                                <Box 
                                    component="form" 
                                    onSubmit={(e) => {
                                        e.preventDefault();
                                        handleSendMessage();
                                    }}
                                    sx={{ display: 'flex', gap: 1, alignItems: 'flex-end' }}
                                >
                                    <TextField
                                        fullWidth
                                        placeholder="Mesajınızı yazın..."
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        disabled={loading}
                                        multiline
                                        maxRows={3}
                                        sx={{
                                            '& .MuiInputBase-root': {
                                                color: 'white',
                                                bgcolor: '#1a1a1a',
                                                minHeight: '48px'
                                            },
                                            '& .MuiInputBase-input::placeholder': {
                                                color: 'rgba(255, 255, 255, 0.5)'
                                            }
                                        }}
                                    />
                                    <IconButton
                                        type="submit"
                                        disabled={!newMessage.trim() || loading}
                                        sx={{ 
                                            bgcolor: '#ff6b35',
                                            color: 'white',
                                            width: '48px',
                                            height: '48px',
                                            '&:hover': {
                                                bgcolor: '#e55a2b'
                                            },
                                            '&:disabled': {
                                                bgcolor: 'rgba(255, 107, 53, 0.3)'
                                            }
                                        }}
                                    >
                                        {loading ? <CircularProgress size={24} color="inherit" /> : <SendIcon />}
                                    </IconButton>
                                </Box>
                            </Box>
                        </Card>
                    </Box>
                </Grid>
            </Grid>
        </Container>
    );
};

export default AIChat; 