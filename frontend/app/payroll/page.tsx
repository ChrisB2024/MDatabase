'use client';

import { Container, Title, Paper, Table, Button, Group, Text, Badge } from '@mantine/core';
import { IconPlus, IconDownload } from '@tabler/icons-react';
import useSWR from 'swr';
import { fetcher } from '@/lib/api';
import { PayRun } from '@/types';
import { formatNaira, exportToCSV } from '@/lib/utils';

export default function PayrollPage() {
  const { data: payRuns, error, isLoading } = useSWR<PayRun[]>('/pay-runs/', fetcher);

  const handleDownload = () => {
    if (!payRuns || payRuns.length === 0) {
      alert('No payroll data to export');
      return;
    }
    
    const exportData = payRuns.map(pr => ({
      'Pay Run ID': pr.pay_run_id,
      'Employee ID': pr.employee_id,
      'Period Start': new Date(pr.start_period).toLocaleDateString(),
      'Period End': new Date(pr.end_period).toLocaleDateString(),
      'Gross Pay (₦)': Number(pr.gross_pay).toFixed(2),
      'Total Deductions (₦)': Number(pr.total_deductions).toFixed(2),
      'Net Pay (₦)': Number(pr.net_pay).toFixed(2),
      'Payment Status': pr.payment_status,
      'Payment Date': pr.pay_date ? new Date(pr.pay_date).toLocaleDateString() : '',
    }));
    
    exportToCSV(exportData, `payroll_${new Date().toISOString().split('T')[0]}`);
  };

  if (error) {
    return (
      <Container size="xl" py="xl">
        <Text c="red">Failed to load pay runs</Text>
      </Container>
    );
  }

  return (
    <Container size="xl" py="xl">
      <Group justify="space-between" mb="xl">
        <Title order={1}>Pay Runs</Title>
        <Group>
          <Button 
            leftSection={<IconDownload size={16} />} 
            variant="light"
            onClick={handleDownload}
          >
            Download CSV
          </Button>
          <Button leftSection={<IconPlus size={16} />}>
            New Pay Run
          </Button>
        </Group>
      </Group>

      <Paper shadow="xs" p="md">
        {isLoading ? (
          <Text>Loading...</Text>
        ) : payRuns && payRuns.length > 0 ? (
          <Table striped highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Employee</Table.Th>
                <Table.Th>Period</Table.Th>
                <Table.Th>Gross Pay</Table.Th>
                <Table.Th>Total Deductions</Table.Th>
                <Table.Th>Net Pay</Table.Th>
                <Table.Th>Status</Table.Th>
                <Table.Th>Actions</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {payRuns.map((payRun) => (
                <Table.Tr key={payRun.pay_run_id}>
                  <Table.Td>Employee #{payRun.employee_id}</Table.Td>
                  <Table.Td>
                    {new Date(payRun.start_period).toLocaleDateString()} - {new Date(payRun.end_period).toLocaleDateString()}
                  </Table.Td>
                  <Table.Td>{formatNaira(Number(payRun.gross_pay))}</Table.Td>
                  <Table.Td>{formatNaira(Number(payRun.total_deductions))}</Table.Td>
                  <Table.Td><strong>{formatNaira(Number(payRun.net_pay))}</strong></Table.Td>
                  <Table.Td>
                    <Badge color={
                      payRun.payment_status === 'paid' ? 'green' :
                        payRun.payment_status === 'pending' ? 'yellow' : 'red'
                    }>
                      {payRun.payment_status === 'paid' ? 'Paid' :
                        payRun.payment_status === 'pending' ? 'Pending' : 'Cancelled'}
                    </Badge>
                  </Table.Td>
                  <Table.Td>
                    <Button component="a" href={`/payroll/${payRun.pay_run_id}`} size="xs" variant="light">View</Button>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        ) : (
          <Text c="dimmed" ta="center" py="xl">
            No pay runs found. Click "New Pay Run" to create one.
          </Text>
        )}
      </Paper>
    </Container>
  );
}
