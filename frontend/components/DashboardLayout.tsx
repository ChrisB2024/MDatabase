'use client';

import { AppShell, NavLink, Group, Title, Text, Stack } from '@mantine/core';
import { 
  IconUsers, 
  IconClock, 
  IconCash, 
  IconSettings,
  IconDashboard,
} from '@tabler/icons-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const navItems = [
    { icon: IconDashboard, label: 'Dashboard', href: '/' },
    { icon: IconUsers, label: 'Employees', href: '/employees' },
    { icon: IconClock, label: 'Work Hours', href: '/work-hours' },
    { icon: IconCash, label: 'Payroll', href: '/payroll' },
    { icon: IconSettings, label: 'Settings', href: '/settings' },
  ];

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{ width: 250, breakpoint: 'sm' }}
      padding="md"
    >
      <AppShell.Header>
        <Group h="100%" px="md">
          <IconCash size={30} color="#228be6" />
          <Title order={3}>Payroll System</Title>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar p="md">
        <Stack gap="xs">
          {navItems.map((item) => (
            <NavLink
              key={item.href}
              component={Link}
              href={item.href}
              label={item.label}
              leftSection={<item.icon size={20} />}
              active={pathname === item.href}
            />
          ))}
        </Stack>
      </AppShell.Navbar>

      <AppShell.Main>{children}</AppShell.Main>
    </AppShell>
  );
}
