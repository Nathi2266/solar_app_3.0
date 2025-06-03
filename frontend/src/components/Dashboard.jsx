import { useEffect, useState } from 'react';
import {
  useColorMode,
  IconButton,
  Box,
  Container,
  Heading,
  Text,
  VStack,
  useColorModeValue,
  Input,
  Button,
  HStack,
  Card,
  CardBody,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  Spinner,
  useToast,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Tooltip,
} from '@chakra-ui/react';
import { FiSun, FiMoon, FiGlobe, FiWifi, FiMapPin, FiRefreshCw } from 'react-icons/fi';
import { FaNetworkWired, FaMobileAlt } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { API_URL } from '../config';

// Helper function for connection icons
const getConnectionIcon = (type) => {
  switch (type?.toLowerCase()) {
    case 'wifi':
      return <FiWifi />;
    case 'broadband':
      return <FaNetworkWired />;
    case 'cellular':
      return <FaMobileAlt />;
    default:
      return <FiGlobe />;
  }
};

function Dashboard() {
  const { colorMode, toggleColorMode } = useColorMode();
  const [userData, setUserData] = useState(null);
  const [currentIP, setCurrentIP] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [ipInput, setIpInput] = useState('');
  const [logs, setLogs] = useState([]);
  const toast = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    console.log('Dashboard mounted'); // Debug log

    const initializeDashboard = async () => {
      try {
        // Check if user is logged in
        const token = localStorage.getItem('token');
        const user = localStorage.getItem('user');
        
        console.log('Token exists:', !!token); // Debug log
        console.log('User data exists:', !!user); // Debug log

        if (!token) {
          console.log('No token found, redirecting to login'); // Debug log
          navigate('/login');
          return;
        }

        // Parse user data if it exists
        if (user) {
          try {
            const parsedUser = JSON.parse(user);
            console.log('Parsed user data:', parsedUser); // Debug log
            setUserData(parsedUser);
          } catch (error) {
            console.error('Error parsing user data:', error);
            setError('Failed to load user data');
          }
        }

        // Initial data fetch
        await trackCurrentIP();
        await fetchLogs();
      } catch (error) {
        console.error('Dashboard initialization error:', error);
        setError('Failed to initialize dashboard');
      } finally {
        setLoading(false);
      }
    };

    initializeDashboard();
  }, [navigate]);

  const trackCurrentIP = async () => {
    try {
      console.log('Tracking current IP...'); // Debug log
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/track`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Current IP data:', data); // Debug log
      setCurrentIP(data);
    } catch (error) {
      console.error('Error tracking IP:', error);
      setError('Failed to track current IP');
      toast({
        title: 'Error',
        description: 'Failed to track current IP',
        status: 'error',
        duration: 3000,
      });
    }
  };

  const trackCustomIP = async () => {
    if (!ipInput) {
      toast({
        title: 'Error',
        description: 'Please enter an IP address',
        status: 'error',
        duration: 3000,
      });
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/track/${ipInput}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setCurrentIP(data);
      toast({
        title: 'Success',
        description: 'IP tracked successfully',
        status: 'success',
        duration: 3000,
      });
    } catch (error) {
      console.error('Error tracking custom IP:', error);
      setError('Failed to track custom IP');
      toast({
        title: 'Error',
        description: 'Failed to track custom IP',
        status: 'error',
        duration: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchLogs = async () => {
    try {
      console.log('Fetching logs...'); // Debug log
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/logs`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Fetched logs:', data); // Debug log
      setLogs(data);
    } catch (error) {
      console.error('Error fetching logs:', error);
      setError('Failed to fetch logs');
      toast({
        title: 'Error',
        description: 'Failed to fetch logs',
        status: 'error',
        duration: 3000,
      });
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  // Show error state
  if (error) {
    return (
      <Container maxW="container.xl" py={8}>
        <VStack spacing={4}>
          <Heading color="red.500">Error</Heading>
          <Text>{error}</Text>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </VStack>
      </Container>
    );
  }

  // Show loading state
  if (loading) {
    return (
      <Container maxW="container.xl" py={8}>
        <VStack spacing={4}>
          <Spinner size="xl" />
          <Text>Loading dashboard...</Text>
        </VStack>
      </Container>
    );
  }

  return (
    <Container maxW="container.xl" py={8}>
      {/* Header with theme toggle and logout */}
      <Box position="absolute" top={4} right={4}>
        <HStack spacing={4}>
          <IconButton
            icon={colorMode === 'light' ? <FiMoon /> : <FiSun />}
            onClick={toggleColorMode}
            variant="ghost"
            aria-label="Toggle color mode"
          />
          <Button onClick={handleLogout} colorScheme="red" variant="ghost">
            Logout
          </Button>
        </HStack>
      </Box>

      <VStack spacing={8} align="stretch">
        <Heading as="h1" size="xl" textAlign="center">
          IP & Device Tracker Dashboard
        </Heading>

        {/* User Information Card */}
        <Card bg={useColorModeValue('white', 'gray.800')} rounded="xl" shadow="lg">
          <CardBody>
            <VStack spacing={4} align="stretch">
              <Heading as="h2" size="md">
                User Information
              </Heading>
              {userData ? (
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                  <Box>
                    <Text fontWeight="bold">Username:</Text>
                    <Text>{userData.username}</Text>
                  </Box>
                  {userData.email && (
                    <Box>
                      <Text fontWeight="bold">Email:</Text>
                      <Text>{userData.email}</Text>
                    </Box>
                  )}
                </SimpleGrid>
              ) : (
                <Text color="red.500">No user data available</Text>
              )}
            </VStack>
          </CardBody>
        </Card>

        {/* IP Tracking Section */}
        <Card bg={useColorModeValue('white', 'gray.800')} rounded="xl" shadow="lg">
          <CardBody>
            <VStack spacing={4} align="stretch">
              <Heading as="h2" size="md">
                IP Tracking
              </Heading>
              <HStack spacing={4}>
                <Input
                  placeholder="Enter IP address"
                  value={ipInput}
                  onChange={(e) => setIpInput(e.target.value)}
                />
                <Button colorScheme="blue" onClick={trackCustomIP}>
                  Track IP
                </Button>
                <IconButton
                  icon={<FiRefreshCw />}
                  onClick={trackCurrentIP}
                  aria-label="Track current IP"
                  colorScheme="green"
                />
              </HStack>
            </VStack>
          </CardBody>
        </Card>

        {/* Current IP Details */}
        {currentIP && (
          <Card bg={useColorModeValue('white', 'gray.800')} rounded="xl" shadow="lg">
            <CardBody>
              <VStack spacing={4} align="stretch">
                <Heading as="h2" size="md">
                  Current IP Details
                </Heading>
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                  <Stat>
                    <StatLabel>IP Address</StatLabel>
                    <StatNumber>{currentIP.ip}</StatNumber>
                  </Stat>
                  <Stat>
                    <StatLabel>Location</StatLabel>
                    <StatNumber>{currentIP.location}</StatNumber>
                  </Stat>
                  {currentIP.latitude && currentIP.longitude && (
                    <Stat>
                      <StatLabel>Coordinates</StatLabel>
                      <StatNumber>
                        {currentIP.latitude.toFixed(4)}, {currentIP.longitude.toFixed(4)}
                      </StatNumber>
                    </Stat>
                  )}
                  {currentIP.connection_type && (
                    <Stat>
                      <StatLabel>Connection Type</StatLabel>
                      <StatNumber>
                        <HStack>
                          {getConnectionIcon(currentIP.connection_type)}
                          <Text>{currentIP.connection_type}</Text>
                        </HStack>
                      </StatNumber>
                    </Stat>
                  )}
                </SimpleGrid>
              </VStack>
            </CardBody>
          </Card>
        )}

        {/* Tracking History */}
        <Card bg={useColorModeValue('white', 'gray.800')} rounded="xl" shadow="lg">
          <CardBody>
            <VStack spacing={4} align="stretch">
              <Heading as="h2" size="md">
                Tracking History
              </Heading>
              {logs.length > 0 ? (
                <Box overflowX="auto">
                  <Table variant="simple">
                    <Thead>
                      <Tr>
                        <Th>IP</Th>
                        <Th>Location</Th>
                        <Th>ISP</Th>
                        <Th>Connection Type</Th>
                        <Th>Timestamp</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {logs.map((log, index) => (
                        <Tr key={index}>
                          <Td>{log.ip}</Td>
                          <Td>{log.location}</Td>
                          <Td>{log.isp}</Td>
                          <Td>
                            <HStack>
                              {getConnectionIcon(log.connection_type)}
                              <Text>{log.connection_type}</Text>
                            </HStack>
                          </Td>
                          <Td>{new Date(log.timestamp).toLocaleString()}</Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                </Box>
              ) : (
                <Text>No tracking history available</Text>
              )}
            </VStack>
          </CardBody>
        </Card>
      </VStack>
    </Container>
  );
}

export default Dashboard;
