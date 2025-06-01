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
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Wrap,
  WrapItem,
} from '@chakra-ui/react';
import { FiSun, FiMoon } from 'react-icons/fi';
import { FaShieldAlt, FaUserSecret, FaNetworkWired } from 'react-icons/fa';

function App() {
  const [log, setLog] = useState(null);
  const [history, setHistory] = useState([]);
  const [inputIP, setInputIP] = useState('');
  const [loading, setLoading] = useState(false);
  const [connectionInfo, setConnectionInfo] = useState(null);
  const { colorMode, toggleColorMode } = useColorMode();
  const toast = useToast();

  // Monitor connection changes
  useEffect(() => {
    const updateConnectionInfo = () => {
      if (navigator.connection) {
        const connection = navigator.connection;
        setConnectionInfo({
          effectiveType: connection.effectiveType || 'unknown',
          downlink: connection.downlink || 'unknown',
          rtt: connection.rtt || 'unknown',
          saveData: connection.saveData || false,
        });
      }
    };

    // Initial check
    updateConnectionInfo();

    // Add event listener for connection changes
    if (navigator.connection) {
      navigator.connection.addEventListener('change', updateConnectionInfo);
    }

    // Cleanup
    return () => {
      if (navigator.connection) {
        navigator.connection.removeEventListener('change', updateConnectionInfo);
      }
    };
  }, []);

  // Fetch history on mount
  useEffect(() => {
    fetchHistory();
    fetchOwnIPAndTrack();
    // eslint-disable-next-line
  }, []);

  // Fetch session history
  const fetchHistory = async () => {
    try {
      const res = await fetch('http://localhost:5000/logs');
      const logs = await res.json();
      setHistory(logs);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch history.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // Track the client's own IP on mount
  const fetchOwnIPAndTrack = async () => {
    setLoading(true);
    try {
      const res = await fetch('https://api.ipify.org?format=json');
      const { ip } = await res.json();
      await trackIP(ip);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch your IP.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
    setLoading(false);
  };

  // Track a given IP (or own IP if blank)
  const trackIP = async (ipToTrack) => {
    setLoading(true);
    try {
      const ip = ipToTrack || inputIP;
      const data = {
        ip: ip || undefined,
        userAgent: navigator.userAgent,
        connectionInfo: connectionInfo, // Include connection info in the request
      };
      const res = await fetch('http://localhost:5000/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      setLog(result);
      fetchHistory();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to track IP.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
    setLoading(false);
  };

  // Handle form submit
  const handleTrack = async (e) => {
    e.preventDefault();
    if (!inputIP) {
      await fetchOwnIPAndTrack();
    } else {
      await trackIP(inputIP);
    }
  };

  return (
    <Box minH="100vh" bg={useColorModeValue('gray.50', 'gray.900')}>
      <Container maxW="7xl" py={8}>
        <VStack spacing={8} align="stretch">
          {/* Header with Theme Toggle */}
          <Box position="relative" textAlign="center">
            <IconButton
              aria-label="Toggle color mode"
              icon={colorMode === 'light' ? <FiMoon size="20px" /> : <FiSun size="20px" />}
              onClick={toggleColorMode}
              position="absolute"
              right="0"
              top="0"
              colorScheme={useColorModeValue('gray', 'yellow')}
              variant="ghost"
              _hover={{
                bg: useColorModeValue('gray.100', 'gray.700'),
              }}
            />
            <Heading as="h1" size="xl" mb={2}>
              📡 IP Tracker
            </Heading>
            <Text color={useColorModeValue('gray.600', 'gray.400')}>
              Real-time IP and device tracking system
            </Text>
          </Box>

          {/* IP Input and Track Button */}
          <Box as="form" onSubmit={handleTrack} w="full">
            <HStack maxW="md" mx="auto" spacing={2}>
              <Input
                placeholder="Enter IP address (e.g. 8.8.8.8)"
                value={inputIP}
                onChange={(e) => setInputIP(e.target.value)}
                bg={useColorModeValue('white', 'gray.800')}
              />
              <Button
                colorScheme="blue"
                type="submit"
                isLoading={loading}
                loadingText="Tracking"
              >
                Track IP
              </Button>
            </HStack>
          </Box>

          {/* Connection Info Card */}
          {connectionInfo && (
            <Card bg={useColorModeValue('white', 'gray.800')} rounded="xl" shadow="lg">
              <CardBody>
                <Heading as="h2" size="md" mb={4}>
                  Connection Information
                </Heading>
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                  <Stat>
                    <StatLabel>Connection Type</StatLabel>
                    <StatNumber>{connectionInfo.effectiveType.toUpperCase()}</StatNumber>
                    <StatHelpText>Network Type</StatHelpText>
                  </Stat>
                  <Stat>
                    <StatLabel>Download Speed</StatLabel>
                    <StatNumber>{connectionInfo.downlink} Mbps</StatNumber>
                    <StatHelpText>Current Speed</StatHelpText>
                  </Stat>
                  <Stat>
                    <StatLabel>Round Trip Time</StatLabel>
                    <StatNumber>{connectionInfo.rtt} ms</StatNumber>
                    <StatHelpText>Network Latency</StatHelpText>
                  </Stat>
                  <Stat>
                    <StatLabel>Data Saver</StatLabel>
                    <StatNumber>
                      <Badge colorScheme={connectionInfo.saveData ? 'green' : 'gray'}>
                        {connectionInfo.saveData ? 'Enabled' : 'Disabled'}
                      </Badge>
                    </StatNumber>
                    <StatHelpText>Data Saving Mode</StatHelpText>
                  </Stat>
                </SimpleGrid>
              </CardBody>
            </Card>
          )}

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
                  <Text><b>IP:</b> {log.ip}</Text>
                  <Text><b>Location:</b> {log.location}</Text>
                  <Text><b>ISP:</b> {log.isp}</Text>
                  <Text><b>Device:</b> {log.device}</Text>
                  <Text>
                    <b>Timestamp:</b>{' '}
                    <Badge colorScheme="blue">{log.timestamp}</Badge>
                  </Text>
                  
                  {/* Security Status Section */}
                  <Box mt={4}>
                    <Heading as="h3" size="sm" mb={2}>
                      Security Status
                    </Heading>
                    <Wrap spacing={2}>
                      <WrapItem>
                        <Badge
                          colorScheme={log.proxy ? 'red' : 'green'}
                          p={2}
                          borderRadius="md"
                          display="flex"
                          alignItems="center"
                          gap={1}
                        >
                          <FaNetworkWired />
                          {log.proxy ? 'Proxy Detected' : 'No Proxy'}
                        </Badge>
                      </WrapItem>
                      <WrapItem>
                        <Badge
                          colorScheme={log.vpn ? 'red' : 'green'}
                          p={2}
                          borderRadius="md"
                          display="flex"
                          alignItems="center"
                          gap={1}
                        >
                          <FaShieldAlt />
                          {log.vpn ? 'VPN Detected' : 'No VPN'}
                        </Badge>
                      </WrapItem>
                      <WrapItem>
                        <Badge
                          colorScheme={log.tor ? 'red' : 'green'}
                          p={2}
                          borderRadius="md"
                          display="flex"
                          alignItems="center"
                          gap={1}
                        >
                          <FaUserSecret />
                          {log.tor ? 'Tor Detected' : 'No Tor'}
                        </Badge>
                      </WrapItem>
                    </Wrap>
                  </Box>

                  {/* Warning Alert if any security flags are detected */}
                  {(log.proxy || log.vpn || log.tor) && (
                    <Alert status="warning" variant="subtle" mt={4}>
                      <AlertIcon />
                      <Box>
                        <AlertTitle>Security Notice</AlertTitle>
                        <AlertDescription>
                          This IP address is using anonymization tools. 
                          {log.proxy && ' Proxy detected. '}
                          {log.vpn && ' VPN detected. '}
                          {log.tor && ' Tor detected. '}
                        </AlertDescription>
                      </Box>
                    </Alert>
                  )}
                </VStack>
              </CardBody>
            </Card>
          )}

          {/* History Table */}
          <Box>
            <Heading as="h2" size="lg" mb={4}>
              Session History
            </Heading>
            <Box bg={useColorModeValue('white', 'gray.800')} rounded="xl" shadow="lg" overflow="hidden">
              <Box overflowX="auto">
                <Table variant="simple">
                  <Thead bg={useColorModeValue('gray.50', 'gray.700')}>
                    <Tr>
                      <Th>IP</Th>
                      <Th>Location</Th>
                      <Th>ISP</Th>
                      <Th>Device</Th>
                      <Th>Timestamp</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
        {history.map(([id, ip, loc, isp, dev, time]) => (
                      <Tr key={id}>
                        <Td fontWeight="medium">{ip}</Td>
                        <Td>{loc}</Td>
                        <Td>{isp}</Td>
                        <Td maxW="200px" isTruncated>{dev}</Td>
                        <Td>
                          <Badge colorScheme="green" fontSize="xs">
                            {time}
                          </Badge>
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </Box>
            </Box>
          </Box>
        </VStack>
      </Container>
    </Box>
  );
}

export default App;
