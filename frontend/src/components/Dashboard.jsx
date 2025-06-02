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
import { FiSun, FiMoon, FiGlobe, FiWifi, FiMapPin } from 'react-icons/fi';
import { FaNetworkWired, FaMobileAlt } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

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
  const [loading, setLoading] = useState(true);
  const [ipInput, setIpInput] = useState('');
  const [logs, setLogs] = useState([]);
  const toast = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    if (!token) {
      navigate('/login');
      return;
    }

    // Parse user data if it exists
    if (user) {
      try {
        setUserData(JSON.parse(user));
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }

    setLoading(false);
  }, [navigate]);

  const trackCurrentIP = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/track', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      setUserData(data);
    } catch (error) {
      console.error('Error tracking IP:', error);
      toast({
        title: 'Error',
        description: 'Failed to track current IP',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const trackCustomIP = async () => {
    if (!ipInput) {
      toast({
        title: 'Error',
        description: 'Please enter an IP address',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/track/${ipInput}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      setUserData(data);
      toast({
        title: 'Success',
        description: 'IP tracked successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error tracking custom IP:', error);
      toast({
        title: 'Error',
        description: 'Failed to track custom IP',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const fetchLogs = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/logs', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      setLogs(data);
    } catch (error) {
      console.error('Error fetching logs:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch logs',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  if (loading) {
    return (
      <Box textAlign="center" py={8}>
        <Spinner size="xl" />
      </Box>
    );
  }

  return (
    <Container maxW="container.xl" py={8}>
      <Box position="absolute" top={4} right={4}>
        <HStack spacing={4}>
          <IconButton
            icon={colorMode === 'light' ? <FiMoon /> : <FiSun />}
            onClick={toggleColorMode}
            variant="ghost"
          />
          <Button onClick={handleLogout} colorScheme="red" variant="ghost">
            Logout
          </Button>
        </HStack>
      </Box>

      <VStack spacing={8} align="stretch">
        <Heading as="h1" size="xl" textAlign="center">
          Welcome to Dashboard
        </Heading>

        <Card bg={useColorModeValue('white', 'gray.800')} rounded="xl" shadow="lg">
          <CardBody>
            <VStack spacing={4} align="stretch">
              <Heading as="h2" size="md">
                User Information
              </Heading>
              
              {userData && (
                <Box>
                  <Text fontWeight="bold">Username:</Text>
                  <Text>{userData.username}</Text>
                  {userData.email && (
                    <>
                      <Text fontWeight="bold" mt={2}>Email:</Text>
                      <Text>{userData.email}</Text>
                    </>
                  )}
                </Box>
              )}
            </VStack>
          </CardBody>
        </Card>

        {/* Add more dashboard content here */}
        <Card bg={useColorModeValue('white', 'gray.800')} rounded="xl" shadow="lg">
          <CardBody>
            <VStack spacing={4} align="stretch">
              <Heading as="h2" size="md">
                Quick Actions
              </Heading>
              <HStack spacing={4}>
                <Button colorScheme="blue">Action 1</Button>
                <Button colorScheme="green">Action 2</Button>
                <Button colorScheme="purple">Action 3</Button>
              </HStack>
            </VStack>
          </CardBody>
        </Card>
      </VStack>
    </Container>
  );
}

export default Dashboard;
