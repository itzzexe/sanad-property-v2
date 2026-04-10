export const TOKENS = {
  colors: {
    primary: {
      50: '#EEF2FF',
      100: '#E0E7FF',
      200: '#C7D2FE',
      400: '#818CF8',
      500: '#6366F1', // Main primary
      600: '#4F46E5',
      700: '#4338CA',
      900: '#312E81',
    },
    accent: {
      50: '#ECFDF5',
      400: '#34D399',
      500: '#10B981',
      600: '#059669',
    },
    neutral: {
      50: '#F8FAFC', // Page background
      100: '#F1F5F9', // Card background
      200: '#E2E8F0', // Light borders
      400: '#94A3B8', // Secondary text
      600: '#475569', // Normal text
      800: '#1E293B', // Dark text
      900: '#0F172A', // Heading text
    },
    status: {
      success: {
        bg: '#ECFDF5',
        text: '#10B981',
      },
      warning: {
        bg: '#FFFBEB',
        text: '#F59E0B',
      },
      danger: {
        bg: '#FEF2F2',
        text: '#EF4444',
      },
      info: {
        bg: '#EFF6FF',
        text: '#3B82F6',
      },
    },
    dark: {
      bg: '#0F172A',
      surface: '#1E293B',
      border: '#334155',
      text: '#E2E8F0',
      muted: '#94A3B8',
    },
  },
  typography: {
    display: {
      size: '36px',
      weight: '700',
      letterSpacing: '-0.02em',
    },
    h1: {
      size: '28px',
      weight: '700',
      letterSpacing: '-0.01em',
    },
    h2: {
      size: '22px',
      weight: '600',
    },
    h3: {
      size: '18px',
      weight: '600',
    },
    h4: {
      size: '16px',
      weight: '500',
    },
    bodyLg: {
      size: '16px',
      weight: '400',
      lineHeight: '1.6',
    },
    body: {
      size: '14px',
      weight: '400',
      lineHeight: '1.5',
    },
    caption: {
      size: '12px',
      weight: '400',
      lineHeight: '1.4',
    },
    label: {
      size: '12px',
      weight: '500',
      letterSpacing: '0.04em',
      textTransform: 'uppercase',
    },
  },
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '12px',
    base: '16px',
    lg: '24px',
    xl: '32px',
    '2xl': '48px',
    '3xl': '64px',
  },
  radius: {
    sm: '6px',
    md: '10px',
    lg: '16px',
    xl: '24px',
    full: '9999px',
  },
  shadows: {
    sm: '0 1px 2px rgba(0,0,0,0.05)',
    md: '0 4px 6px rgba(0,0,0,0.07), 0 1px 3px rgba(0,0,0,0.06)',
    lg: '0 10px 15px rgba(0,0,0,0.08), 0 4px 6px rgba(0,0,0,0.04)',
    focus: '0 0 0 3px rgba(99,102,241,0.3)',
  },
} as const;
