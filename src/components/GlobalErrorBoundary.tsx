/**
 * GlobalErrorBoundary — penampung crash React render tree (fitur #6.
 * Crash yang terjadi di render otomatis terlapor via GlobalErrorHandler
 * (yang akan diteruskan ke Sentry di App.tsx).
 * Acuan resmi RN: https://reactnative.dev/docs/errorboundary
 */
import { Component, ErrorInfo, ReactNode } from 'react';
import { Pressable, Text, View } from 'react-native';
import { toAppError, GlobalErrorHandler } from '../utils/errors';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  message: string;
}

export class GlobalErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, message: '' };

  static getDerivedStateFromError(error: unknown): State {
    const appError = toAppError(error);
    return { hasError: true, message: appError.userMessage };
  }

  componentDidCatch(error: unknown, info: ErrorInfo): void {
    GlobalErrorHandler.report(toAppError(error), 'ErrorBoundary:' + info.componentStack);
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <View className="flex-1 items-center justify-center gap-4 bg-obsidian px-8">
        <Text className="text-lg font-semibold text-zinc-100">Oops, terjadi kesalahan</Text>
        <Text className="text-center text-sm text-zinc-400">{this.state.message}</Text>
        <Pressable
          onPress={() => this.setState({ hasError: false, message: '' })}
          className="rounded-full bg-obsidian-accent px-6 py-3 active:opacity-70"
        >
          <Text className="font-semibold text-white">Coba Lagi</Text>
        </Pressable>
      </View>
    );
  }
}
