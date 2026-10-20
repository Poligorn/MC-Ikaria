package me.ikaria.sound.mixin;

import me.ikaria.sound.IkariaSoundControl;
import net.minecraft.client.resources.sounds.SimpleSoundInstance;
import net.minecraft.sounds.SoundEvent;
import net.minecraft.world.phys.Vec3;
import org.spongepowered.asm.mixin.Mixin;
import org.spongepowered.asm.mixin.injection.At;
import org.spongepowered.asm.mixin.injection.Inject;
import org.spongepowered.asm.mixin.injection.callback.CallbackInfoReturnable;

@Mixin(SimpleSoundInstance.class)
public abstract class SimpleSoundInstanceMixin {
    @Inject(method = "forJukeboxSong", at = @At("RETURN"))
    private static void ikariasound$markJukebox(SoundEvent sound, Vec3 pos, CallbackInfoReturnable<SimpleSoundInstance> cir) {
        IkariaSoundControl.markJukebox(cir.getReturnValue());
    }
}
