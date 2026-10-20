package me.ikaria.sound.voicechat;

import de.maxhenkel.voicechat.api.ForgeVoicechatPlugin;
import de.maxhenkel.voicechat.api.VoicechatApi;
import de.maxhenkel.voicechat.api.VoicechatClientApi;
import de.maxhenkel.voicechat.api.VoicechatPlugin;
import de.maxhenkel.voicechat.api.VolumeCategory;
import de.maxhenkel.voicechat.api.events.ClientVoicechatInitializationEvent;
import de.maxhenkel.voicechat.api.events.EventRegistration;
import me.ikaria.sound.IkariaSoundMod;

@ForgeVoicechatPlugin
public class IkariaVoicechatPlugin implements VoicechatPlugin {
    private static volatile VoicechatClientApi clientApi;
    private static volatile boolean categoryRegistered;

    public static float radioCategoryVolume() {
        VoicechatClientApi api = clientApi;
        if (api == null) {
            return 1.0f;
        }
        try {
            return (float) api.getVolumeConfig().getCategoryVolume(IkariaSoundMod.SVC_RADIO_CATEGORY);
        } catch (Throwable ignored) {
            return 1.0f;
        }
    }

    @Override
    public String getPluginId() {
        return IkariaSoundMod.MODID;
    }

    @Override
    public void initialize(VoicechatApi api) {
        if (api instanceof VoicechatClientApi client) {
            registerCategory(client);
        }
    }

    @Override
    public void registerEvents(EventRegistration registration) {
        registration.registerEvent(ClientVoicechatInitializationEvent.class, this::onClientInit);
    }

    private void onClientInit(ClientVoicechatInitializationEvent event) {
        registerCategory(event.getVoicechat());
    }

    private static synchronized void registerCategory(VoicechatClientApi api) {
        clientApi = api;
        if (categoryRegistered) {
            return;
        }
        VolumeCategory category = api.volumeCategoryBuilder()
                .setId(IkariaSoundMod.SVC_RADIO_CATEGORY)
                .setName("Live Radio")
                .setNameTranslationKey("voicechat.category.ikariasound.live_radio")
                .setDescription("Internet radio from Live Radio Mod. Mute this to avoid capturing copyrighted streams.")
                .setDescriptionTranslationKey("voicechat.category.ikariasound.live_radio.desc")
                .setIcon(RadioCategoryIcon.create())
                .build();
        api.registerClientVolumeCategory(category);
        categoryRegistered = true;
    }
}
