'use client';

import { Container, Title, Paper, Table, Button, Group, Text, Badge } from '@mantine/core';
import { IconPlus, IconDownload } from '@tabler/icons-react';
import useSWR from 'swr';
import { fetcher, workHoursApi } from '@/lib/api';
import { WorkHours } from '@/types';
import { useState } from 'react';
import AddWorkHoursModal from '@/components/AddWorkHoursModal';
import EditWorkHoursModal from '@/components/EditWorkHoursModal';
import ConfirmDeleteModal from '@/components/ConfirmDeleteModal';
import { exportToCSV } from '@/lib/utils';
import { notifications } from '@mantine/notifications';

export default function WorkHoursPage() {
  const { data: workHours, error, isLoading, mutate } = useSWR<WorkHours[]>('/work-hours/', fetcher);
  const [modalOpened, setModalOpened] = useState(false);
  const [editModalOpened, setEditModalOpened] = useState(false);
  const [deleteModalOpened, setDeleteModalOpened] = useState(false);
  const [selectedWorkHours, setSelectedWorkHours] = useState<WorkHours | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const handleEditWorkHours = (wh: WorkHours) => {
    setSelectedWorkHours(wh);
    setEditModalOpened(true);
  };

  const handleDeleteClick = (wh: WorkHours) => {
    setSelectedWorkHours(wh);
    setDeleteModalOpened(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedWorkHours) return;
    
    setDeleteLoading(true);
    try {
      await workHoursApi.delete(selectedWorkHours.record_id);
      notifications.show({
        title: 'Success',
        message: 'Work hours deleted successfully',
        color: 'green',
      });
      mutate();
      setDeleteModalOpened(false);
      setSelectedWorkHours(null);
    } catch (error: any) {
      notifications.show({
        title: 'Error',
        message: error.response?.data?.detail || 'Failed to delete work hours',
        color: 'red',
      });
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleDownload = () => {
    if (!workHours || workHours.length === 0) {
      alert('No work hours to export');
      return;
    }
    
    const exportData = workHours.map(wh => ({
      'Record ID': wh.record_id,
      'Employee ID': wh.employee_id,
      'Work Date': new Date(wh.date).toLocaleDateString(),
      'Hours Worked': wh.hours_worked,
      'Overtime Hours': wh.overtime_hours || 0,
      'Approved': wh.is_approved ? 'Yes' : 'No',
      'Approved By': wh.approved_by || '',
      'Notes': wh.notes || '',
    }));
    
    exportToCSV(exportData, `work_hours_${new Date().toISOString().split('T')[0]}`);
  };

  if (error) {
    return (
      <Container size="xl" py="xl">
        <Text c="red">Failed to load work hours</Text>
      </Container>
    );
  }

  return (
    <Container size="xl" py="xl">
      <AddWorkHoursModal
        opened={modalOpened}
        onClose={() => setModalOpened(false)}
        onSuccess={() => mutate()}
      />

      <EditWorkHoursModal
        opened={editModalOpened}
        onClose={() => {
          setEditModalOpened(false);
          setSelectedWorkHours(null);
        }}
        onSuccess={() => mutate()}
        workHours={selectedWorkHours}
      />

      <ConfirmDeleteModal
        opened={deleteModalOpened}
        onClose={() => {
          setDeleteModalOpened(false);
          setSelectedWorkHours(null);
        }}
        onConfirm={handleDeleteConfirm}
        title="Delete Work Hours"
        message={`Are you sure you want to delete this work hours record from ${selectedWorkHours?.date ? new Date(selectedWorkHours.date).toLocaleDateString() : ''}? This action cannot be undone.`}
        loading={deleteLoading}
      />

      <Group justify="space-between" mb="xl">
        <Title order={1}>Work Hours</Title>
        <Group>
          <Button 
            leftSection={<IconDownload size={16} />} 
            variant="light"
            onClick={handleDownload}
          >
            Download CSV
          </Button>
          <Button leftSection={<IconPlus size={16} />} onClick={() => setModalOpened(true)}>
            Log Hours
          </Button>
        </Group>
      </Group>

      <Paper shadow="xs" p="md">
        {isLoading ? (
          <Text>Loading...</Text>
        ) : workHours && workHours.length > 0 ? (
          <Table striped highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Date</Table.Th>
                <Table.Th>Employee</Table.Th>
                <Table.Th>Regular Hours</Table.Th>
                <Table.Th>Overtime Hours</Table.Th>
                <Table.Th>Status</Table.Th>
                <Table.Th>Actions</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {workHours.map((record) => (
                <Table.Tr key={record.record_id}>
                  <Table.Td>{new Date(record.date).toLocaleDateString()}</Table.Td>
                  <Table.Td>Employee #{record.employee_id}</Table.Td>
                  <Table.Td>{record.hours_worked}</Table.Td>
                  <Table.Td>{record.overtime_hours}</Table.Td>
                  <Table.Td>
                    <Badge color={record.is_approved ? 'green' : 'yellow'}>
                      {record.is_approved ? 'Approved' : 'Pending'}
                    </Badge>
                  </Table.Td>
                  <Table.Td>
                    <Group gap="xs">
                      <Button 
                        size="xs" 
                        variant="light"
                        color="blue"
                        onClick={() => handleEditWorkHours(record)}
                      >
                        Edit
                      </Button>
                      <Button 
                        size="xs" 
                        variant="light"
                        color="red"
                        onClick={() => handleDeleteClick(record)}
                      >
                        Delete
                      </Button>
                    </Group>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        ) : (
          <Text c="dimmed" ta="center" py="xl">
            No work hours logged yet. Click "Log Hours" to get started.
          </Text>
        )}
      </Paper>
    </Container>
  );
}
