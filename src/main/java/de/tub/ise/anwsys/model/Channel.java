package de.tub.ise.anwsys.model;

import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import javax.persistence.*;

import java.util.List;

@Entity
@Table(name = "Channels")
public class Channel {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "channel_id")
    private long id;

    @Column(unique = true)
    private String channelName;

    private String channelTopic;

    public long getId() {
        return id;
    }

    public void setId(long id) {
        this.id = id;
    }

    public String getChannelName() {
        return channelName;
    }

    public void setChannelName(String channelName) {
        this.channelName = channelName;
    }

    public String getChannelTopic() {
        return channelTopic;
    }

    public void setChannelTopic(String channelTopic) {
        this.channelTopic = channelTopic;
    }
}
