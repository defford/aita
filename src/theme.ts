import { extendTheme } from '@chakra-ui/react'

const colors = {
  brand: {
    900: '#212A31', // Darkest - header backgrounds
    800: '#2E3944', // Dark - card backgrounds
    700: '#124E66', // Medium - accents and highlights
    600: '#748D92', // Light - secondary text
    500: '#D3D9D4', // Lightest - borders and dividers
  },
  verdict: {
    asshole: {
      bg: '#212A31',
      text: '#D3D9D4',
    },
    notAsshole: {
      bg: '#124E66',
      text: '#D3D9D4',
    },
    undecided: {
      bg: '#748D92',
      text: '#212A31',
    },
  },
}

const theme = extendTheme({
  colors,
  styles: {
    global: {
      body: {
        bg: '#2E3944',
        color: '#D3D9D4',
      },
    },
  },
  components: {
    Heading: {
      baseStyle: {
        color: '#D3D9D4',
      },
    },
    Text: {
      baseStyle: {
        color: '#D3D9D4',
      },
    },
    Badge: {
      baseStyle: {
        px: 3,
        py: 1,
        borderRadius: 'full',
        fontWeight: 'medium',
      },
      variants: {
        asshole: {
          bg: colors.verdict.asshole.bg,
          color: colors.verdict.asshole.text,
        },
        notAsshole: {
          bg: colors.verdict.notAsshole.bg,
          color: colors.verdict.notAsshole.text,
        },
        undecided: {
          bg: colors.verdict.undecided.bg,
          color: colors.verdict.undecided.text,
        },
      },
    },
  },
})

export default theme
