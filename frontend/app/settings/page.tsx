'use client';

import { Container, Title, Paper, Table, Button, Group, Text } from '@mantine/core';
import { IconPlus, IconDownload } from '@tabler/icons-react';
import useSWR from 'swr';
import { fetcher, taxProfileApi } from '@/lib/api';
import { TaxDeductionProfile } from '@/types';
import { useState } from 'react';
import AddTaxProfileModal from '@/components/AddTaxProfileModal';
import EditTaxProfileModal from '@/components/EditTaxProfileModal';
import ConfirmDeleteModal from '@/components/ConfirmDeleteModal';
import { exportToCSV } from '@/lib/utils';
import { notifications } from '@mantine/notifications';

export default function SettingsPage() {
  const { data: profiles, error, isLoading, mutate } = useSWR<TaxDeductionProfile[]>('/taxes-deductions/', fetcher);
  const [modalOpened, setModalOpened] = useState(false);
  const [editModalOpened, setEditModalOpened] = useState(false);
  const [deleteModalOpened, setDeleteModalOpened] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState<TaxDeductionProfile | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const handleEditProfile = (profile: TaxDeductionProfile) => {
    setSelectedProfile(profile);
    setEditModalOpened(true);
  };

  const handleDeleteClick = (profile: TaxDeductionProfile) => {
    setSelectedProfile(profile);
    setDeleteModalOpened(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedProfile) return;
    
    setDeleteLoading(true);
    try {
      await taxProfileApi.delete(selectedProfile.profile_id);
      notifications.show({
        title: 'Success',
        message: 'Tax profile deleted successfully',
        color: 'green',
      });
      mutate();
      setDeleteModalOpened(false);
      setSelectedProfile(null);
    } catch (error: any) {
      notifications.show({
        title: 'Error',
        message: error.response?.data?.detail || 'Failed to delete tax profile',
        color: 'red',
      });
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleDownload = () => {
    if (!profiles || profiles.length === 0) {
      alert('No tax profiles to export');
      return;
    }
    
    const exportData = profiles.map(profile => ({
      'Profile ID': profile.profile_id,
      'Profile Name': profile.profile_name,
      'Description': profile.description || '',
      'PIT Rate': (profile.federal_tax_rate * 100).toFixed(2) + '%',
      'State Tax Rate': (profile.state_tax_rate * 100).toFixed(2) + '%',
      'Local Tax Rate': (profile.local_tax_rate * 100).toFixed(2) + '%',
      'Pension Rate': (profile.social_security_rate * 100).toFixed(2) + '%',
      'NHF Rate': (profile.medicare_rate * 100).toFixed(2) + '%',
      'Health Insurance (₦)': profile.health_insurance.toFixed(2),
      'Other Deductions (₦)': profile.other_deductions.toFixed(2),
    }));
    
    exportToCSV(exportData, `tax_profiles_${new Date().toISOString().split('T')[0]}`);
  };

  if (error) {
    return (
      <Container size="xl" py="xl">
        <Text c="red">Failed to load tax profiles</Text>
      </Container>
    );
  }

  return (
    <Container size="xl" py="xl">
      <AddTaxProfileModal
        opened={modalOpened}
        onClose={() => setModalOpened(false)}
        onSuccess={() => mutate()}
      />

      <EditTaxProfileModal
        opened={editModalOpened}
        onClose={() => {
          setEditModalOpened(false);
          setSelectedProfile(null);
        }}
        onSuccess={() => mutate()}
        profile={selectedProfile}
      />

      <ConfirmDeleteModal
        opened={deleteModalOpened}
        onClose={() => {
          setDeleteModalOpened(false);
          setSelectedProfile(null);
        }}
        onConfirm={handleDeleteConfirm}
        title="Delete Tax Profile"
        message={`Are you sure you want to delete the tax profile "${selectedProfile?.profile_name}"? This action cannot be undone and may affect employees using this profile.`}
        loading={deleteLoading}
      />

      <Group justify="space-between" mb="xl">
        <Title order={1}>Tax & Deduction Profiles</Title>
        <Group>
          <Button 
            leftSection={<IconDownload size={16} />} 
            variant="light"
            onClick={handleDownload}
          >
            Download CSV
          </Button>
          <Button leftSection={<IconPlus size={16} />} onClick={() => setModalOpened(true)}>
            Add Profile
          </Button>
        </Group>
      </Group>

      <Paper shadow="xs" p="md">
        {isLoading ? (
          <Text>Loading...</Text>
        ) : profiles && profiles.length > 0 ? (
          <Table striped highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Profile Name</Table.Th>
                <Table.Th>Federal Tax</Table.Th>
                <Table.Th>State Tax</Table.Th>
                <Table.Th>Social Security</Table.Th>
                <Table.Th>Medicare</Table.Th>
                <Table.Th>Actions</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {profiles.map((profile) => (
                <Table.Tr key={profile.profile_id}>
                  <Table.Td><strong>{profile.profile_name}</strong></Table.Td>
                  <Table.Td>{(Number(profile.federal_tax_rate) * 100).toFixed(2)}%</Table.Td>
                  <Table.Td>{(Number(profile.state_tax_rate) * 100).toFixed(2)}%</Table.Td>
                  <Table.Td>{(Number(profile.social_security_rate) * 100).toFixed(2)}%</Table.Td>
                  <Table.Td>{(Number(profile.medicare_rate) * 100).toFixed(2)}%</Table.Td>
                  <Table.Td>
                    <Group gap="xs">
                      <Button 
                        size="xs" 
                        variant="light"
                        color="blue"
                        onClick={() => handleEditProfile(profile)}
                      >
                        Edit
                      </Button>
                      <Button 
                        size="xs" 
                        variant="light"
                        color="red"
                        onClick={() => handleDeleteClick(profile)}
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
            No tax profiles found. Click "Add Profile" to create one.
          </Text>
        )}
      </Paper>
    </Container>
  );
}
