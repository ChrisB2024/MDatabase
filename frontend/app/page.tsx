'use client';

import { useEffect, useState } from 'react';
import {
  Container,
  Title,
  Grid,
  Card,
  Text,
  Group,
  Stack,
  Button,
  Table,
  Badge,
  LoadingOverlay,
  Select,
} from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import { notifications } from '@mantine/notifications';
import { IconUsers, IconCash, IconReceipt, IconCalendar } from '@tabler/icons-react';
import { formatNaira } from '@/lib/utils';
import { payRunApi } from '@/lib/api';
import type { PayrollDashboard } from '@/types';
import DashboardLayout from '@/components/DashboardLayout';

export default function HomePage() {
  const [loading, setLoading] = useState(false);
  const [dashboard, setDashboard] = useState<PayrollDashboard | null>(null);
  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([
    new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    new Date(),
  ]);

  const loadDashboard = async () => {
    if (!dateRange[0] || !dateRange[1]) return;

    setLoading(true);
    try {
      const response = await payRunApi.getDashboard(
        dateRange[0].toISOString().split('T')[0],
        dateRange[1].toISOString().split('T')[0]
      );
      setDashboard(response.data);
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to load dashboard data',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, [dateRange]);

  const handleApprove = async (payRunIds: number[]) => {
    try {
      await payRunApi.approve(payRunIds);
      notifications.show({
        title: 'Success',
        message: `${payRunIds.length} pay run(s) approved`,
        color: 'green',
      });
      loadDashboard();
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to approve pay runs',
        color: 'red',
      });
    }
  };

  const stats = dashboard?.summary;

  return (
    <DashboardLayout>
      <Container size="xl">
        <Stack gap="lg">
          <Group justify="space-between">
            <Title order={1}>Payroll Dashboard</Title>
            <DatePickerInput
              type="range"
              placeholder="Select date range"
              value={dateRange}
              onChange={setDateRange}
              leftSection={<IconCalendar size={16} />}
            />
          </Group>

          <LoadingOverlay visible={loading} />

          {stats && (
            <Grid>
              <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
                <Card shadow="sm" padding="lg" radius="md" withBorder>
                  <Group justify="space-between">
                    <Stack gap={5}>
                      <Text size="sm" c="dimmed">
                        Employees
                      </Text>
                      <Text size="xl" fw={700}>
                        {stats.employee_count}
                      </Text>
                    </Stack>
                    <IconUsers size={40} color="#228be6" />
                  </Group>
                </Card>
              </Grid.Col>

              <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
                <Card shadow="sm" padding="lg" radius="md" withBorder>
                  <Group justify="space-between">
                    <Stack gap={5}>
                      <Text size="sm" c="dimmed">
                        Gross Pay
                      </Text>
                      <Text size="xl" fw={700}>
                        {formatNaira(stats.total_gross_pay)}
                      </Text>
                    </Stack>
                    <IconCash size={40} color="#40c057" />
                  </Group>
                </Card>
              </Grid.Col>

              <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
                <Card shadow="sm" padding="lg" radius="md" withBorder>
                  <Group justify="space-between">
                    <Stack gap={5}>
                      <Text size="sm" c="dimmed">
                        Total Taxes
                      </Text>
                      <Text size="xl" fw={700}>
                        {formatNaira(stats.total_taxes)}
                      </Text>
                    </Stack>
                    <IconReceipt size={40} color="#fa5252" />
                  </Group>
                </Card>
              </Grid.Col>

              <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
                <Card shadow="sm" padding="lg" radius="md" withBorder>
                  <Group justify="space-between">
                    <Stack gap={5}>
                      <Text size="sm" c="dimmed">
                        Net Pay
                      </Text>
                      <Text size="xl" fw={700}>
                        {formatNaira(stats.total_net_pay)}
                      </Text>
                    </Stack>
                    <IconCash size={40} color="#7950f2" />
                  </Group>
                </Card>
              </Grid.Col>
            </Grid>
          )}

          {dashboard && dashboard.pay_runs.length > 0 && (
            <Card shadow="sm" padding="lg" radius="md" withBorder>
              <Stack gap="md">
                <Group justify="space-between">
                  <Title order={3}>Pending Pay Runs</Title>
                  <Button
                    onClick={() =>
                      handleApprove(
                        dashboard.pay_runs
                          .filter((pr) => pr.payment_status === 'pending')
                          .map((pr) => pr.pay_run_id)
                      )
                    }
                    disabled={
                      !dashboard.pay_runs.some((pr) => pr.payment_status === 'pending')
                    }
                  >
                    Approve All
                  </Button>
                </Group>

                <Table striped highlightOnHover>
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th>Employee</Table.Th>
                      <Table.Th>Period</Table.Th>
                      <Table.Th>Gross Pay</Table.Th>
                      <Table.Th>Taxes</Table.Th>
                      <Table.Th>Net Pay</Table.Th>
                      <Table.Th>Status</Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {dashboard.pay_runs.map((payRun) => (
                      <Table.Tr key={payRun.pay_run_id}>
                        <Table.Td>{payRun.employee_name}</Table.Td>
                        <Table.Td>
                          {new Date(payRun.start_period).toLocaleDateString()} -{' '}
                          {new Date(payRun.end_period).toLocaleDateString()}
                        </Table.Td>
                        <Table.Td>{formatNaira(payRun.gross_pay)}</Table.Td>
                        <Table.Td>{formatNaira(payRun.total_taxes)}</Table.Td>
                        <Table.Td fw={700}>{formatNaira(payRun.net_pay)}</Table.Td>
                        <Table.Td>
                          <Badge
                            color={
                              payRun.payment_status === 'paid'
                                ? 'green'
                                : payRun.payment_status === 'pending'
                                ? 'yellow'
                                : 'red'
                            }
                          >
                            {payRun.payment_status === 'paid' ? 'Paid' : 
                             payRun.payment_status === 'pending' ? 'Pending' : 'Cancelled'}
                          </Badge>
                        </Table.Td>
                      </Table.Tr>
                    ))}
                  </Table.Tbody>
                </Table>
              </Stack>
            </Card>
          )}

          {dashboard && dashboard.pay_runs.length === 0 && (
            <Card shadow="sm" padding="lg" radius="md" withBorder>
              <Text c="dimmed" ta="center">
                No pay runs found for the selected period
              </Text>
            </Card>
          )}
        </Stack>
      </Container>
    </DashboardLayout>
  );
}
