import { useState } from 'react';
import { Text, StyleSheet } from 'react-native';
import { EaseView } from 'react-native-ease/uniwind';

import { Button } from '../components/Button';
import { Section } from '../components/Section';

export function UniwindDemo() {
  const [active, setActive] = useState(false);

  return (
    <Section title="Uniwind className">
      <EaseView
        className="self-stretch rounded-2xl bg-[#2a2a4a] px-4 py-4"
        animate={{
          translateY: active ? -8 : 0,
          scale: active ? 1.03 : 1,
          opacity: active ? 1 : 0.85,
        }}
        transition={{ type: 'spring', damping: 15, stiffness: 140, mass: 1 }}
      >
        <Text style={styles.title}>Uniwind integration</Text>
        <Text style={styles.body}>
          This card uses Uniwind for layout classes and EaseView for native
          animations.
        </Text>
      </EaseView>
      <Button
        label={active ? 'Reset' : 'Animate'}
        onPress={() => setActive((v) => !v)}
      />
    </Section>
  );
}

const styles = StyleSheet.create({
  title: {
    marginBottom: 6,
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  body: {
    color: '#b9bedb',
    lineHeight: 20,
  },
});
