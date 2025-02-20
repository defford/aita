import { useState } from 'react'
import {
  VStack,
  Textarea,
  Button,
  Text,
  Box,
} from '@chakra-ui/react'

interface StoryFormProps {
  onSubmit: (story: string) => void
  isLoading: boolean
}

export const StoryForm = ({ onSubmit, isLoading }: StoryFormProps) => {
  const [story, setStory] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (story.trim()) {
      onSubmit(story)
    }
  }

  return (
    <Box as="form" onSubmit={handleSubmit} width="100%">
      <VStack spacing={4} align="stretch" bg="brand.900" p={6} borderRadius="lg" borderWidth="1px" borderColor="brand.700">
        <Text fontSize="lg" color="brand.500">
          Share your story
        </Text>
        <Textarea
          value={story}
          onChange={(e) => setStory(e.target.value)}
          placeholder="Tell us what happened..."
          minH="200px"
          bg="brand.800"
          color="brand.500"
          borderColor="brand.700"
          _hover={{ borderColor: 'brand.600' }}
          _focus={{ borderColor: 'brand.600', boxShadow: 'none' }}
          resize="vertical"
        />
        <Button
          type="submit"
          isLoading={isLoading}
          bg="brand.700"
          color="brand.500"
          _hover={{ bg: 'brand.600' }}
          _active={{ bg: 'brand.800' }}
          isDisabled={!story.trim()}
        >
          Get Judgments
        </Button>
      </VStack>
    </Box>
  )
}
