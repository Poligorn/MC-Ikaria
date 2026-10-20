package me.ikaria.radiovolume.voicechat;

import de.maxhenkel.voicechat.api.ForgeVoicechatPlugin;
import de.maxhenkel.voicechat.api.VoicechatApi;
import de.maxhenkel.voicechat.api.VoicechatClientApi;
import de.maxhenkel.voicechat.api.VoicechatPlugin;
import de.maxhenkel.voicechat.api.VolumeCategory;
import de.maxhenkel.voicechat.api.events.ClientVoicechatInitializationEvent;
import de.maxhenkel.voicechat.api.events.EventRegistration;
import me.ikaria.radiovolume.RadioVolumeMod;

@ForgeVoicechatPlugin
public class RadioVolumeVoicechatPlugin implements VoicechatPlugin {
    private static volatile VoicechatClientApi clientApi;
    private static volatile boolean categoryRegistered;

    public static VoicechatClientApi clientApi() {
        return clientApi;
    }

    @Override
    public String getPluginId() {
        return RadioVolumeMod.MODID;
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
                .setId(RadioVolumeMod.SVC_CATEGORY_ID)
                .setName("Live Radio")
                .setNameTranslationKey("voicechat.category.radiovolume.live_radio")
                .setDescription("Internet radio from Live Radio Mod. Mute this to avoid capturing copyrighted streams.")
                .setDescriptionTranslationKey("voicechat.category.radiovolume.live_radio.desc")
                .setIcon(RadioCategoryIcon.create())
                .build();
        api.registerClientVolumeCategory(category);
        categoryRegistered = true;
    }
}
