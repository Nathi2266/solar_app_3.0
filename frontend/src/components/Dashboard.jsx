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
  const [log, setLog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [ipInput, setIpInput] = useState('');
  const [logs, setLogs] = useState([]);
  const toast = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    trackCurrentIP();
    fetchLogs();
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
      setLog(data);
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
      setLog(data);
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
          IP & Device Tracker
        </Heading>

        {/* IP Input Section */}
        <Card bg={useColorModeValue('white', 'gray.800')} rounded="xl" shadow="lg">
          <CardBody>
            <HStack spacing={4}>
              <Input
                placeholder="Enter IP address"
                value={ipInput}
                onChange={(e) => setIpInput(e.target.value)}
              />
              <Button colorScheme="blue" onClick={trackCustomIP}>
                Track IP
              </Button>
            </HStack>
          </CardBody>
        </Card>

        {/* Current Session Card */}
        {loading ? (
          <Box textAlign="center" py={8}>
            <Spinner size="xl" />
          </Box>
        ) : log && (
          <Card bg={useColorModeValue('white', 'gray.800')} rounded="xl" shadow="lg" overflow="hidden">
            <CardBody>
              <VStack align="stretch" spacing={4}>
                <Heading as="h2" size="md" mb={2}>
                  Tracked IP Details
                </Heading>
                
                {/* Basic Info */}
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                  <Box>
                    <Text fontWeight="bold">IP Address</Text>
                    <Text>{log.ip}</Text>
                  </Box>
                  <Box>
                    <Text fontWeight="bold">Location</Text>
                    <Text>{log.location}</Text>
                  </Box>
                </SimpleGrid>

                {/* Coordinates */}
                {log.latitude && log.longitude && (
                  <Box>
                    <Text fontWeight="bold" display="flex" alignItems="center" gap={2}>
                      <FiMapPin /> Coordinates
                    </Text>
                    <Text>
                      {log.latitude.toFixed(4)}, {log.longitude.toFixed(4)}
                    </Text>
                  </Box>
                )}

                {/* Network Info */}
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                  {log.asn && (
                    <Box>
                      <Text fontWeight="bold">ASN</Text>
                      <Badge colorScheme="blue">{log.asn}</Badge>
                    </Box>
                  )}
                  {log.isp && (
                    <Box>
                      <Text fontWeight="bold">ISP</Text>
                      <Text fontStyle="italic">{log.isp}</Text>
                    </Box>
                  )}
                </SimpleGrid>

                {/* Connection Type */}
                {log.connection_type && (
                  <Box>
                    <Text fontWeight="bold" display="flex" alignItems="center" gap={2}>
                      {getConnectionIcon(log.connection_type)} Connection Type
                    </Text>
                    <Badge colorScheme="purple" textTransform="capitalize">
                      {log.connection_type}
                    </Badge>
                  </Box>
                )}

                {/* Carrier (if available) */}
                {log.carrier && (
                  <Box>
                    <Text fontWeight="bold">Carrier</Text>
                    <Text>{log.carrier}</Text>
                  </Box>
                )}

                {/* Timestamp */}
                <Box>
                  <Text fontWeight="bold">Timestamp</Text>
                  <Badge colorScheme="blue">{log.timestamp}</Badge>
                </Box>
              </VStack>
            </CardBody>
          </Card>
        )}

        {/* Logs Table */}
        <Card bg={useColorModeValue('white', 'gray.800')} rounded="xl" shadow="lg" overflow="hidden">
          <CardBody>
            <Heading as="h2" size="md" mb={4}>
              Tracking History
            </Heading>
            <Box overflowX="auto">
              <Table variant="simple">
                <Thead>
                  <Tr>
                    <Th>IP</Th>
                    <Th>Location</Th>
                    <Th>ISP</Th>
                    <Th>Device</Th>
                    <Th>Timestamp</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {logs.map((log, index) => (
                    <Tr key={index}>
                      <Td>{log.ip}</Td>
                      <Td>{log.location}</Td>
                      <Td>{log.isp}</Td>
                      <Td>{log.device}</Td>
                      <Td>{log.timestamp}</Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </Box>
          </CardBody>
        </Card>
      </VStack>
    </Container>
  );
}

export default Dashboard;
