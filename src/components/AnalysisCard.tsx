import {
  Box,
  Badge,
  Text,
  VStack,
  HStack,
  useColorModeValue,
} from '@chakra-ui/react'
import { Analysis, VerdictType } from '../types'

interface AnalysisCardProps {
  title: string
  analysis: Analysis
}

export const AnalysisCard = ({ title, analysis }: AnalysisCardProps) => {
  return (
    <Box
      bg="brand.900"
      p={6}
      borderRadius="lg"
      boxShadow="lg"
      borderWidth="1px"
      borderColor="brand.700"
      transition="transform 0.2s"
      _hover={{ transform: 'translateY(-2px)' }}
    >
      <VStack align="start" spacing={3}>
        <Text fontSize="xl" fontWeight="bold" color="brand.500">
          {title}
        </Text>
        <HStack spacing={2}>
          <VerdictBadge label="User" verdict={analysis.verdicts.user} />
          <VerdictBadge label="Others" verdict={analysis.verdicts.others} />
        </HStack>
        <Text color="brand.600" fontSize="md">
          {analysis.content}
        </Text>
      </VStack>
    </Box>
  )
}

interface VerdictBadgeProps {
  label: string
  verdict: VerdictType
}

const VerdictBadge = ({ label, verdict }: VerdictBadgeProps) => {
  const getVerdictVariant = (verdict: VerdictType) => {
    switch (verdict) {
      case 'YTA':
        return 'asshole'
      case 'NTA':
        return 'notAsshole'
      default:
        return 'undecided'
    }
  }

  return (
    <Badge
      variant={getVerdictVariant(verdict)}
      display="flex"
      alignItems="center"
    >
      <Text fontSize="xs" fontWeight="bold" mr={1}>
        {label}:
      </Text>
      {verdict === 'YTA' ? 'The Asshole' : verdict === 'NTA' ? 'Not The Asshole' : 'Undecided'}
    </Badge>
  )
}
