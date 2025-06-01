import { useEffect, useState } from 'react';
import { useColorMode, IconButton, Box, Container, Heading, Text, VStack, useColorModeValue } from '@chakra-ui/react';
import { FiSun, FiMoon } from 'react-icons/fi';

function App() {
  const [log, setLog] = useState(null);
  const [history, setHistory] = useState([]);
  const { colorMode, toggleColorMode } = useColorMode();

  useEffect(() => {
    const fetchIPData = async () => {
      try {
        // Fetch IP from ipify
        const res = await fetch("https://api.ipify.org?format=json");
        const { ip } = await res.json();

        // Send tracking data to backend
        const data = {
          ip,
          userAgent: navigator.userAgent
        };

        const res2 = await fetch("http://localhost:5000/track", {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });
        const result = await res2.json();
        setLog(result);

        // Fetch history
        const res3 = await fetch("http://localhost:5000/logs");
        const logs = await res3.json();
        setHistory(logs);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchIPData();
  }, []);

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
                bg: useColorModeValue('gray.100', 'gray.700')
              }}
            />
            <Heading as="h1" size="xl" mb={2}>
              📡 IP Tracker
            </Heading>
            <Text color={useColorModeValue('gray.600', 'gray.400')}>
              Real-time IP and device tracking system
            </Text>
          </Box>

          {/* Current Session Card */}
          {log && (
            <Box bg={useColorModeValue('white', 'gray.800')} rounded="xl" shadow="lg" overflow="hidden">
              <Box p={6}>
                <Heading as="h2" size="md" mb={4}>
                  Current Session
                </Heading>
                <VStack spacing={4} align="stretch">
                  <Box bg={useColorModeValue('gray.50', 'gray.700')} p={4} rounded="lg">
                    <Text fontSize="sm" color={useColorModeValue('gray.600', 'gray.400')}>IP Address</Text>
                    <Text fontSize="lg" fontWeight="medium">{log.ip}</Text>
                  </Box>
                  <Box bg={useColorModeValue('gray.50', 'gray.700')} p={4} rounded="lg">
                    <Text fontSize="sm" color={useColorModeValue('gray.600', 'gray.400')}>Location</Text>
                    <Text fontSize="lg" fontWeight="medium">{log.location}</Text>
                  </Box>
                  <Box bg={useColorModeValue('gray.50', 'gray.700')} p={4} rounded="lg">
                    <Text fontSize="sm" color={useColorModeValue('gray.600', 'gray.400')}>ISP</Text>
                    <Text fontSize="lg" fontWeight="medium">{log.isp}</Text>
                  </Box>
                </VStack>
              </Box>
            </Box>
          )}

          {/* History Table */}
          <Box>
            <Heading as="h2" size="lg" mb={4}>
              Session History
            </Heading>
            <Box bg={useColorModeValue('white', 'gray.800')} rounded="xl" shadow="lg" overflow="hidden">
              <Box overflowX="auto">
                <Box as="table" w="full">
                  <Box as="thead" bg={useColorModeValue('gray.50', 'gray.700')}>
                    <Box as="tr">
                      <Box as="th" px={6} py={3} textAlign="left" fontSize="xs" fontWeight="medium" textTransform="uppercase" letterSpacing="wider">IP</Box>
                      <Box as="th" px={6} py={3} textAlign="left" fontSize="xs" fontWeight="medium" textTransform="uppercase" letterSpacing="wider">Location</Box>
                      <Box as="th" px={6} py={3} textAlign="left" fontSize="xs" fontWeight="medium" textTransform="uppercase" letterSpacing="wider">ISP</Box>
                      <Box as="th" px={6} py={3} textAlign="left" fontSize="xs" fontWeight="medium" textTransform="uppercase" letterSpacing="wider">Device</Box>
                      <Box as="th" px={6} py={3} textAlign="left" fontSize="xs" fontWeight="medium" textTransform="uppercase" letterSpacing="wider">Timestamp</Box>
                    </Box>
                  </Box>
                  <Box as="tbody" divideY divideColor={useColorModeValue('gray.200', 'gray.700')}>
                    {history.map(([id, ip, loc, isp, dev, time]) => (
                      <Box as="tr" key={id} _hover={{ bg: useColorModeValue('gray.50', 'gray.700') }}>
                        <Box as="td" px={6} py={4} fontSize="sm" fontWeight="medium">{ip}</Box>
                        <Box as="td" px={6} py={4} fontSize="sm">{loc}</Box>
                        <Box as="td" px={6} py={4} fontSize="sm">{isp}</Box>
                        <Box as="td" px={6} py={4} fontSize="sm" maxW="xs" isTruncated>{dev}</Box>
                        <Box as="td" px={6} py={4}>
                          <Box as="span" px={2.5} py={0.5} rounded="full" fontSize="xs" fontWeight="medium" bg={useColorModeValue('green.100', 'green.900')} color={useColorModeValue('green.800', 'green.200')}>
                            {time}
                          </Box>
                        </Box>
                      </Box>
                    ))}
                  </Box>
                </Box>
              </Box>
            </Box>
          </Box>
        </VStack>
      </Container>
    </Box>
  );
}

export default App;
