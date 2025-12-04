/**
 * Example usage of the design system components
 * This file demonstrates how to use the atomic and molecular components
 */

import React, { useState } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Button, Text, Input, Icon } from './atoms';
import { Card, FormField, ListItem } from './molecules';
import theme from '../theme';

const DesignSystemExample = () => {
  const [inputValue, setInputValue] = useState('');
  const [formValue, setFormValue] = useState('');
  const [hasError, setHasError] = useState(false);

  return (
    <ScrollView style={styles.container}>
      {/* Typography Examples */}
      <Card style={styles.section}>
        <Text variant="h3" style={styles.sectionTitle}>Typography</Text>
        <Text variant="h1">Heading 1</Text>
        <Text variant="h2">Heading 2</Text>
        <Text variant="h3">Heading 3</Text>
        <Text variant="body1">Body text with normal weight</Text>
        <Text variant="body2">Smaller body text</Text>
        <Text variant="caption">Caption text for hints</Text>
      </Card>

      {/* Button Examples */}
      <Card style={styles.section}>
        <Text variant="h3" style={styles.sectionTitle}>Buttons</Text>
        <Button
          variant="primary"
          size="md"
          onPress={() => console.log('Primary pressed')}
          accessibilityLabel="Primary button"
          style={styles.button}
        >
          Primary Button
        </Button>
        <Button
          variant="secondary"
          size="md"
          onPress={() => console.log('Secondary pressed')}
          accessibilityLabel="Secondary button"
          style={styles.button}
        >
          Secondary Button
        </Button>
        <Button
          variant="outline"
          size="md"
          onPress={() => console.log('Outline pressed')}
          accessibilityLabel="Outline button"
          style={styles.button}
        >
          Outline Button
        </Button>
        <Button
          variant="ghost"
          size="md"
          onPress={() => console.log('Ghost pressed')}
          accessibilityLabel="Ghost button"
          style={styles.button}
        >
          Ghost Button
        </Button>
        <Button
          variant="primary"
          size="md"
          loading={true}
          onPress={() => {}}
          accessibilityLabel="Loading button"
          style={styles.button}
        >
          Loading
        </Button>
        <Button
          variant="primary"
          size="md"
          disabled={true}
          onPress={() => {}}
          accessibilityLabel="Disabled button"
          style={styles.button}
        >
          Disabled
        </Button>
      </Card>

      {/* Input Examples */}
      <Card style={styles.section}>
        <Text variant="h3" style={styles.sectionTitle}>Inputs</Text>
        <Input
          value={inputValue}
          onChangeText={setInputValue}
          placeholder="Enter text here"
          accessibilityLabel="Text input"
          style={styles.input}
        />
        <Input
          value={inputValue}
          onChangeText={setInputValue}
          placeholder="Input with error"
          error={true}
          errorMessage="This field is required"
          accessibilityLabel="Error input"
          style={styles.input}
        />
        <Input
          value=""
          onChangeText={() => {}}
          placeholder="Disabled input"
          disabled={true}
          accessibilityLabel="Disabled input"
          style={styles.input}
        />
      </Card>

      {/* FormField Examples */}
      <Card style={styles.section}>
        <Text variant="h3" style={styles.sectionTitle}>Form Fields</Text>
        <FormField
          label="Username"
          value={formValue}
          onChangeText={setFormValue}
          placeholder="Enter username"
          required={true}
          helperText="Choose a unique username"
        />
        <FormField
          label="Email"
          value=""
          onChangeText={() => {}}
          placeholder="Enter email"
          error={hasError}
          errorMessage="Invalid email format"
          keyboardType="email-address"
        />
      </Card>

      {/* ListItem Examples */}
      <Card style={styles.section} padding="none">
        <View style={styles.listHeader}>
          <Text variant="h3">List Items</Text>
        </View>
        <ListItem
          title="Simple List Item"
          onPress={() => console.log('Item pressed')}
          accessibilityLabel="Simple list item"
        />
        <ListItem
          title="List Item with Subtitle"
          subtitle="This is a subtitle with additional information"
          onPress={() => console.log('Item pressed')}
          accessibilityLabel="List item with subtitle"
        />
        <ListItem
          title="List Item with Right Text"
          rightText="Details"
          onPress={() => console.log('Item pressed')}
          accessibilityLabel="List item with right text"
        />
        <ListItem
          title="Disabled List Item"
          subtitle="This item is disabled"
          disabled={true}
          onPress={() => console.log('Item pressed')}
          accessibilityLabel="Disabled list item"
          divider={false}
        />
      </Card>

      {/* Card Examples */}
      <View style={styles.section}>
        <Text variant="h3" style={styles.sectionTitle}>Cards</Text>
        <Card elevation="sm" style={styles.card}>
          <Text variant="subtitle1">Small Elevation Card</Text>
          <Text variant="body2">This card has a small shadow</Text>
        </Card>
        <Card elevation="md" style={styles.card}>
          <Text variant="subtitle1">Medium Elevation Card</Text>
          <Text variant="body2">This card has a medium shadow</Text>
        </Card>
        <Card elevation="lg" style={styles.card}>
          <Text variant="subtitle1">Large Elevation Card</Text>
          <Text variant="body2">This card has a large shadow</Text>
        </Card>
        <Card
          elevation="md"
          onPress={() => console.log('Card pressed')}
          accessibilityLabel="Pressable card"
          style={styles.card}
        >
          <Text variant="subtitle1">Pressable Card</Text>
          <Text variant="body2">This card can be pressed</Text>
        </Card>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.default,
  },
  section: {
    margin: theme.spacing.md,
  },
  sectionTitle: {
    marginBottom: theme.spacing.md,
  },
  button: {
    marginBottom: theme.spacing.sm,
  },
  input: {
    marginBottom: theme.spacing.md,
  },
  listHeader: {
    padding: theme.spacing.md,
  },
  card: {
    marginBottom: theme.spacing.md,
  },
});

export default DesignSystemExample;
