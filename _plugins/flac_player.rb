#!/usr/bin/env ruby

require 'liquid'

module Jekyll
  class FlacPlayerTag < Liquid::Tag
    def initialize(tag_name, text, tokens)
      super
      @url = text.strip
    end

    def render(context)
      "<audio controls><source src=\"#{@url}\" type=\"audio/flac\"></audio>"
    end
  end
end

Liquid::Template.register_tag('flac_player', Jekyll::FlacPlayerTag)

# holly shit, github doesn't support this plug-in ;(