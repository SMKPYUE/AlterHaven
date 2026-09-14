import type { Alter, SwitchWebhookConfig } from '../types';

export async function dispatchSwitchWebhook(
  webhook: SwitchWebhookConfig,
  currentFront: Alter | null,
  coFronts: Alter[],
  note?: string
): Promise<{ success: boolean; error?: string }> {
  if (!webhook.isEnabled || !webhook.url.trim()) {
    return { success: false, error: 'Webhook is disabled or URL is empty' };
  }

  // Filter out alters that opted out of external broadcast
  if (currentFront && !currentFront.allowExternalBroadcast) {
    return { success: false, error: 'Active alter opted out of external broadcasts' };
  }

  try {
    let payload: any;
    let headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (webhook.customHeaders) {
      try {
        const parsed = JSON.parse(webhook.customHeaders);
        headers = { ...headers, ...parsed };
      } catch (e) {
        console.warn('Failed to parse custom headers JSON', e);
      }
    }

    if (webhook.preset === 'discord_webhook') {
      const alterName = currentFront ? currentFront.name : 'Unknown';
      const pronouns = currentFront ? currentFront.pronouns.join('/') : '';
      const roles = currentFront ? currentFront.roles.join(', ') : '';
      const colorInt = currentFront ? parseInt(currentFront.colorHex.replace('#', ''), 16) : 6548465;

      const coFrontText = coFronts.length > 0
        ? `\n**Co-Conscious / Co-Front:** ${coFronts.map((a: Alter) => `${a.name} (${a.pronouns.join('/')})`).join(', ')}`
        : '';

      const noteText = note ? `\n\n*Note:* ${note}` : '';

      payload = {
        username: 'AlterHaven Switch Alert',
        avatar_url: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=150&auto=format&fit=crop&q=60',
        embeds: [
          {
            title: `⚡ System Switch: ${alterName}`,
            description: `**Pronouns:** ${pronouns || 'Not specified'}\n**Roles:** ${roles || 'None'}${coFrontText}${noteText}`,
            color: isNaN(colorInt) ? 0x6366f1 : colorInt,
            footer: {
              text: `AlterHaven • ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
            },
            timestamp: new Date().toISOString(),
          },
        ],
      };
    } else if (webhook.preset === 'pluralkit') {
      payload = {
        switch_event: 'front_changed',
        front: currentFront ? { name: currentFront.name, pronouns: currentFront.pronouns } : null,
        co_front: coFronts.map((a: Alter) => ({ name: a.name, pronouns: a.pronouns })),
        timestamp: Date.now(),
      };
    } else {
      // Custom JSON or template
      if (webhook.customPayloadTemplate) {
        let template = webhook.customPayloadTemplate;
        template = template.replace(/{{alter_name}}/g, currentFront?.name || '');
        template = template.replace(/{{pronouns}}/g, currentFront?.pronouns.join('/') || '');
        template = template.replace(/{{color}}/g, currentFront?.colorHex || '#6366f1');
        template = template.replace(/{{timestamp}}/g, new Date().toISOString());
        payload = JSON.parse(template);
      } else {
        payload = {
          event: 'system_switch',
          alter: currentFront,
          coFronts,
          timestamp: Date.now(),
          note,
        };
      }
    }

    const response = await fetch(webhook.url, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errText = await response.text().catch(() => 'Unknown network error');
      return { success: false, error: `HTTP ${response.status}: ${errText.slice(0, 150)}` };
    }

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Network request failed' };
  }
}
