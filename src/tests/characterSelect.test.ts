import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { CharacterSelectStage } from '../components/CharacterSelectStage';

describe('CharacterSelectStage 3D Carousel', () => {
  it('renders all three flying creatures with aerodynamic stat meters and deploy button', () => {
    const onDeploy = vi.fn();
    const onSelect = vi.fn();
    const html = renderToString(React.createElement(CharacterSelectStage, {
      selectedKitId: 'japanese-01',
      onSelectCreature: onSelect,
      onDeployToCliff: onDeploy
    }));

    expect(html).toContain('Sacred Peace Crane');
    expect(html).toContain('Celestial Dragon');
    expect(html).toContain('Peregrine Falcon');
    expect(html).toContain('DEPLOY TO CLIFF');
    expect(html).toContain('Glide');
    expect(html).toContain('Speed');
    expect(html).toContain('Agility');
  });
});
