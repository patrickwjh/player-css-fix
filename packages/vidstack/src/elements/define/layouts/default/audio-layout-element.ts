import { html } from 'lit-html';
import { effect, onDispose } from 'maverick.js';
import { Host } from 'maverick.js/element';
import { setAttribute } from 'maverick.js/std';

import { DefaultAudioLayout } from '../../../../components/layouts/default/audio-layout';
import type { MediaContext } from '../../../../core';
import { useMediaContext } from '../../../../core/api/media-context';
import { $computed } from '../../../lit/directives/signal';
import { LitElement, type LitRenderer } from '../../../lit/lit-element';
import { SlotManager } from '../slot-manager';
import {
  DefaultAudioLayoutLarge,
  DefaultAudioLayoutSmall,
  DefaultAudioLoadLayout,
} from './audio-layout';
import { DefaultLayoutIconsLoader } from './icons-loader';
import { createMenuContainer } from './shared-layout';

/**
 * @docs {@link https://www.vidstack.io/docs/wc/player/components/layouts/default-layout}
 * @example
 * ```html
 * <media-player>
 *   <media-provider></media-provider>
 *   <media-audio-layout></media-audio-layout>
 * </media-player>
 * ```
 */
export class MediaAudioLayoutElement
  extends Host(LitElement, DefaultAudioLayout)
  implements LitRenderer
{
  static tagName = 'media-audio-layout';

  private _media!: MediaContext;

  protected onSetup() {
    // Avoid memory leaks if `keepAlive` is true. The DOM will re-render regardless.
    this.forwardKeepAlive = false;

    this._media = useMediaContext();

    this.classList.add('vds-audio-layout');
    this.menuContainer = createMenuContainer('vds-audio-layout');

    effect(() => {
      if (!this.menuContainer) return;
      setAttribute(this.menuContainer, 'data-size', this.isSmallLayout && 'sm');
    });

    onDispose(() => this.menuContainer?.remove());
  }

  protected onConnect() {
    this._media.player.el?.setAttribute('data-layout', 'audio');
    onDispose(() => this._media.player.el?.removeAttribute('data-layout'));

    effect(() => {
      if (this.$props.customIcons()) {
        new SlotManager(this).connect();
      } else {
        new DefaultLayoutIconsLoader(this).connect();
      }
    });
  }

  render() {
    return html`${$computed(this._render.bind(this))}`;
  }

  private _render() {
    const { load } = this._media.$props,
      { canLoad, streamType } = this._media.$state;
    return this.isMatch
      ? load() === 'play' && !canLoad()
        ? DefaultAudioLoadLayout()
        : streamType() !== 'unknown'
          ? this.isSmallLayout
            ? DefaultAudioLayoutSmall()
            : DefaultAudioLayoutLarge()
          : null
      : null;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'media-audio-layout': MediaAudioLayoutElement;
  }
}
