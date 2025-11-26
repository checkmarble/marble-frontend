import { NavLink } from '@remix-run/react';
import { cn } from 'ui-design-system';

export function CasesNavigationTabs() {
  return (
    <div className="flex p-v2-xs gap-v2-xs rounded-v2-md bg-purple-96 self-start justify-self-start">
      <NavLink
        to="/cases/overview"
        className={({ isActive }) =>
          cn(
            'flex items-center h-8 px-v2-sm text-s font-medium',
            isActive ? 'bg-purple-65 text-white rounded-v2-md' : 'bg-purple-96 text-purple-65',
          )
        }
      >
        <span>Overview</span>
      </NavLink>
      <NavLink
        to="/cases/analytics"
        className={({ isActive }) =>
          cn(
            'flex items-center h-8 px-v2-sm text-s font-medium',
            isActive ? 'bg-purple-65 text-white rounded-v2-md' : 'bg-purple-96 text-purple-65',
          )
        }
      >
        <span>Analytics</span>
      </NavLink>
      <NavLink
        to="/cases/inboxes"
        className={({ isActive }) =>
          cn(
            'flex items-center h-8 px-v2-sm text-s font-medium',
            isActive ? 'bg-purple-65 text-white rounded-v2-md' : 'bg-purple-96 text-purple-65',
          )
        }
      >
        <span>Cases</span>
      </NavLink>
    </div>
  );
}
