/**
 * Icon Mapping Utilities
 * Centralized Feather Icon names for consistency across screens
 */

export const ICON_NAMES = {
  // Navigation
  HOME: 'home',
  USERS: 'users',
  CALENDAR: 'calendar',
  SEND: 'send',
  MENU: 'menu',
  MORE_HORIZONTAL: 'more-horizontal',
  CHEVRON_RIGHT: 'chevron-right',
  CHEVRON_LEFT: 'chevron-left',
  ARROW_LEFT: 'arrow-left',
  
  // Medical
  USER: 'user',
  USER_PLUS: 'user-plus',
  ACTIVITY: 'activity',
  TRENDING_UP: 'trending-up',
  MEDICAL_ICON: 'activity', // For medical acts
  PILL: 'pill',
  HEART: 'heart',
  
  // Actions
  SEARCH: 'search',
  SETTINGS: 'settings',
  BELL: 'bell',
  EDIT: 'edit',
  TRASH_2: 'trash-2',
  CHECK: 'check',
  X: 'x',
  PLUS: 'plus',
  DOWNLOAD: 'download',
  UPLOAD: 'upload',
  FILE: 'file',
  
  // Analytics & Charts
  BAR_CHART_2: 'bar-chart-2',
  CHART_LINE: 'line-chart',
  PIE_CHART: 'pie-chart',
  
  // Status Icons
  CHECK_CIRCLE: 'check-circle',
  ALERT_CIRCLE: 'alert-circle',
  INFO: 'info',
  
  // UI
  LOCK: 'lock',
  UNLOCK: 'unlock',
  EYE: 'eye',
  EYE_OFF: 'eye-off',
  PHONE: 'phone',
  MAIL: 'mail',
  MAP_PIN: 'map-pin',
  CLOCK: 'clock',
  STAR: 'star',
  
  // Appointments & Dates
  CALENDAR_TODAY: 'calendar',
  TIME_ICON: 'clock',
  
  // Chat
  MESSAGE_CIRCLE: 'message-circle',
  SEND_MESSAGE: 'send',
  PAPERCLIP: 'paperclip',
};

/**
 * Category Icon Map
 * Maps categories to appropriate Feather icons
 */
export const CATEGORY_ICONS = {
  consultation: 'activity',
  intervention: 'heart',
  followup: 'check-circle',
  diagnostic: 'bar-chart-2',
  treatment: 'pill',
};

/**
 * Status Colors & Icons
 */
export const STATUS_CONFIG = {
  scheduled: {
    icon: 'calendar',
    color: '#3B82F6', // blue
  },
  completed: {
    icon: 'check-circle',
    color: '#059669', // emerald
  },
  cancelled: {
    icon: 'x-circle',
    color: '#DC2626', // red
  },
  pending: {
    icon: 'clock',
    color: '#D97706', // amber
  },
  active: {
    icon: 'check-circle',
    color: '#059669',
  },
  inactive: {
    icon: 'x-circle',
    color: '#6B7280',
  },
};
