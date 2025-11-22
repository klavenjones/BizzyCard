/**
 * Error boundary component for catching React errors
 */

import { Component, ReactNode } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Button } from './ui/button';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: { componentStack: string }) {
    // Log error to error reporting service (e.g., Sentry)
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <View className="flex-1 items-center justify-center p-6 bg-background">
          <Text className="text-2xl font-bold text-foreground mb-4">Something went wrong</Text>
          <Text className="text-muted-foreground text-center mb-6">
            {this.state.error?.message || 'An unexpected error occurred'}
          </Text>
          <Button onPress={this.handleReset} variant="default">
            <Text className="text-primary-foreground">Try Again</Text>
          </Button>
        </View>
      );
    }

    return this.props.children;
  }
}

