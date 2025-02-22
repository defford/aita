import { useState } from 'react'
import {
  Box,
  Container,
  Heading,
  Text,
  SimpleGrid,
  VStack,
  useToast,
  Flex,
} from '@chakra-ui/react'
import { StoryForm } from './components/StoryForm'
import { AnalysisCard } from './components/AnalysisCard'
import { AnalysisResponse } from './types'
import axios from 'axios'

// API Configuration
const api = axios.create({
  baseURL: import.meta.env.PROD ? 'https://aita-eta.vercel.app/api' : '/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add request interceptor for debugging
api.interceptors.request.use(request => {
  console.log('Request:', {
    url: request.url,
    method: request.method,
    headers: request.headers,
    data: request.data
  });
  return request;
});

// Add response interceptor for debugging
api.interceptors.response.use(
  response => {
    console.log('Response:', {
      status: response.status,
      headers: response.headers,
      data: response.data
    });
    return response;
  },
  error => {
    console.error('Response error:', {
      message: error.message,
      status: error.response?.status,
      headers: error.response?.headers,
      data: error.response?.data
    });
    return Promise.reject(error);
  }
);

export default function App() {
  const [isLoading, setIsLoading] = useState(false)
  const [results, setResults] = useState<AnalysisResponse | null>(null)
  const toast = useToast()

  const handleSubmit = async (story: string) => {
    setIsLoading(true)
    try {
      console.log('Sending request to:', '/api/analyze')
      const response = await api.post('/analyze', { story })
      console.log('Response:', {
        status: response.status,
        statusText: response.statusText,
        data: response.data
      })
      setResults(response.data)
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to analyze your story. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
      console.error('Analysis error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const formatTitle = (key: string) => {
    return key
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }

  return (
    <Flex minH="100vh" bg="brand.800" align="center" direction="column">
      <Container maxW="container.lg" py={8} px={4}>
        <VStack spacing={8} align="stretch" w="full">
          <VStack spacing={4} textAlign="center" bg="brand.900" p={8} borderRadius="lg" w="full">
            <Heading size="2xl" color="brand.500">
              Am I The Asshole?
            </Heading>
            <Text fontSize="xl" color="brand.600">
              Get perspectives from 10 different personalities
            </Text>
          </VStack>

          <StoryForm onSubmit={handleSubmit} isLoading={isLoading} />

          {results && (
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6} w="full">
              {Object.entries(results).map(([personality, analysis]) => (
                <AnalysisCard
                  key={personality}
                  title={formatTitle(personality)}
                  analysis={analysis}
                />
              ))}
            </SimpleGrid>
          )}
        </VStack>
      </Container>
    </Flex>
  )
}
