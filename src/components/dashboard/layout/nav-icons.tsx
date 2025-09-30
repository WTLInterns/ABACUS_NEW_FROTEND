import type { Icon } from '@phosphor-icons/react/dist/lib/types';
import { ChartPieIcon } from '@phosphor-icons/react/dist/ssr/ChartPie';
import { GearSixIcon } from '@phosphor-icons/react/dist/ssr/GearSix';
import { PlugsConnectedIcon } from '@phosphor-icons/react/dist/ssr/PlugsConnected';
import { UserIcon } from '@phosphor-icons/react/dist/ssr/User';
import { UsersIcon } from '@phosphor-icons/react/dist/ssr/Users';
import { XSquare } from '@phosphor-icons/react/dist/ssr/XSquare';
import { ArrowUpIcon } from '@phosphor-icons/react/dist/ssr/ArrowUp';
import { ClockIcon } from '@phosphor-icons/react/dist/ssr/Clock';
import { PencilIcon } from '@phosphor-icons/react/dist/ssr/Pencil';
import { TrophyIcon } from '@phosphor-icons/react/dist/ssr/Trophy';
import { FileTextIcon } from '@phosphor-icons/react/dist/ssr/FileText';
import { BackpackIcon } from '@phosphor-icons/react/dist/ssr/Backpack';
import { GraduationCapIcon } from '@phosphor-icons/react/dist/ssr/GraduationCap';
import { PackageIcon } from '@phosphor-icons/react/dist/ssr/Package';

export const navIcons = {
  'chart-pie': ChartPieIcon,
  'gear-six': GearSixIcon,
  'plugs-connected': PlugsConnectedIcon,
  'x-square': XSquare,
  user: UserIcon,
  users: UsersIcon,
  'arrow-up': ArrowUpIcon,
  clock: ClockIcon,
  pencil: PencilIcon,
  trophy: TrophyIcon,
  'file-text': FileTextIcon,
  'graduation-cap': GraduationCapIcon,
  package: PackageIcon,
  backpack: BackpackIcon,
} as Record<string, Icon>;