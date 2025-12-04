import React from 'react';
import { Text, View } from 'react-native';
import { renderWithProviders } from './utils/test-utils';
import { mockUser, mockMany } from './utils/mockDataFactories';

// Example component for testing
const ExampleComponent = ({ title, users }) => (
  <View testID="example-component">
    <Text testID="title">{title}</Text>
    {users.map(user => (
      <Text key={user.id} testID={`user-${user.id}`}>
        {user.username}
      </Text>
    ))}
  </View>
);

describe('Example Test Suite', () => {
  it('should render component with title', () => {
    const { getByTestId } = renderWithProviders(
      <ExampleComponent title="Test Title" users={[]} />
    );

    const titleElement = getByTestId('title');
    expect(titleElement).toBeTruthy();
    expect(titleElement.props.children).toBe('Test Title');
  });

  it('should render users from mock data', () => {
    const mockUsers = mockMany(mockUser, 3);
    const { getByTestId } = renderWithProviders(
      <ExampleComponent title="Users" users={mockUsers} />
    );

    mockUsers.forEach(user => {
      const userElement = getByTestId(`user-${user.id}`);
      expect(userElement).toBeTruthy();
      expect(userElement.props.children).toBe(user.username);
    });
  });

  it('should work with Redux store', () => {
    const initialState = {
      auth: {
        user: mockUser(),
        isAuthenticated: true,
      },
    };

    const { store } = renderWithProviders(
      <ExampleComponent title="Test" users={[]} />,
      { initialState }
    );

    expect(store.getState().auth.isAuthenticated).toBe(true);
  });
});
