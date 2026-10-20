package me.ikaria.sound.mixin;

import com.llamalad7.mixinextras.injector.ModifyReturnValue;
import me.ikaria.sound.IkariaSoundControl;
import org.spongepowered.asm.mixin.Mixin;
import org.spongepowered.asm.mixin.Pseudo;
import org.spongepowered.asm.mixin.injection.At;

/**
 * Scales Live Radio's private Java Sound gain (PCM samples and SourceDataLine MASTER_GAIN).
 */
@Pseudo
@Mixin(targets = "com.radiomod.radio.RadioPlayer", remap = false)
public abstract class RadioPlayerMixin {
    @ModifyReturnValue(method = "computeLinearGain()F", at = @At("RETURN"))
    private float ikariasound$scaleGain(float original) {
        return IkariaSoundControl.applyRadioGain(original);
    }
}
