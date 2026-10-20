package me.ikaria.radiovolume.mixin;

import com.llamalad7.mixinextras.injector.ModifyReturnValue;
import me.ikaria.radiovolume.RadioVolumeControl;
import org.spongepowered.asm.mixin.Mixin;
import org.spongepowered.asm.mixin.Pseudo;
import org.spongepowered.asm.mixin.injection.At;

/**
 * Scales Live Radio's private Java Sound gain. The original mod applies this
 * both to decoded PCM samples and to SourceDataLine MASTER_GAIN.
 */
@Pseudo
@Mixin(targets = "com.radiomod.radio.RadioPlayer")
public abstract class RadioPlayerMixin {
    @ModifyReturnValue(method = "computeLinearGain()F", at = @At("RETURN"))
    private float radiovolume$scaleGain(float original) {
        return RadioVolumeControl.apply(original);
    }
}
