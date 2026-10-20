package me.ikaria.sound.mixin;

import com.llamalad7.mixinextras.injector.ModifyReturnValue;
import me.ikaria.sound.IkariaSoundControl;
import net.minecraft.client.resources.sounds.SoundInstance;
import net.minecraft.client.sounds.SoundEngine;
import net.minecraft.sounds.SoundSource;
import org.spongepowered.asm.mixin.Mixin;
import org.spongepowered.asm.mixin.injection.At;
import org.spongepowered.asm.mixin.injection.Inject;
import org.spongepowered.asm.mixin.injection.callback.CallbackInfo;
import org.spongepowered.asm.mixin.injection.callback.CallbackInfoReturnable;

@Mixin(SoundEngine.class)
public abstract class SoundEngineMixin {
    @Inject(method = "play(Lnet/minecraft/client/resources/sounds/SoundInstance;)V", at = @At("HEAD"))
    private void ikariasound$pushPlay(SoundInstance sound, CallbackInfo ci) {
        IkariaSoundControl.pushPlaying(sound);
    }

    @Inject(method = "play(Lnet/minecraft/client/resources/sounds/SoundInstance;)V", at = @At("RETURN"))
    private void ikariasound$popPlay(SoundInstance sound, CallbackInfo ci) {
        IkariaSoundControl.popPlaying();
    }

    @Inject(method = "calculateVolume(Lnet/minecraft/client/resources/sounds/SoundInstance;)F", at = @At("HEAD"))
    private void ikariasound$pushCalc(SoundInstance sound, CallbackInfoReturnable<Float> cir) {
        IkariaSoundControl.pushPlaying(sound);
    }

    @Inject(method = "calculateVolume(Lnet/minecraft/client/resources/sounds/SoundInstance;)F", at = @At("RETURN"))
    private void ikariasound$popCalc(SoundInstance sound, CallbackInfoReturnable<Float> cir) {
        IkariaSoundControl.popPlaying();
    }

    @ModifyReturnValue(method = "calculateVolume(FLnet/minecraft/sounds/SoundSource;)F", at = @At("RETURN"))
    private float ikariasound$scale(float original, float volume, SoundSource source) {
        return original * IkariaSoundControl.extraMultiplierForCurrent();
    }
}
